'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, Loader2, X, User, MapPin, Package, CreditCard, ChevronDown, ChevronRight, Download, Calendar, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export const getStatusDisplayName = (status?: string) => {
  switch (status) {
    case 'pending': return 'Pending (COD)'
    case 'paid': return 'Paid / Processing'
    case 'packed': return 'Packed'
    case 'shipped': return 'Shipped'
    case 'out_for_delivery': return 'Out For Delivery'
    case 'delivered': return 'Delivered'
    case 'cancelled': return 'Cancelled'
    default: return status ? status.replace(/_/g, ' ') : 'Unknown'
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const { adminPassword, setAdminUnlocked } = useAuthStore()

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState('All Orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [paymentFilter, setPaymentFilter] = useState('All Payment Methods')

  const exportToCSV = () => {
    const csvContent = [
      ['Order ID', 'Customer Name', 'Customer Email', 'Date', 'Total Amount', 'Payment Method', 'Status'],
      ...filteredOrders.map(order => [
        order.id,
        order.users?.full_name || 'Unknown',
        order.users?.email || 'N/A',
        new Date(order.created_at).toLocaleDateString(),
        order.total_amount,
        order.payment_method || 'Online',
        order.status
      ])
    ].map(e => e.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `orders_export_${new Date().getTime()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({ orderId, newStatus })
      })
      if (res.ok) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus })
        }
      } else {
        const errText = await res.text()
        console.error('Failed to update status:', errText)
      }
    } catch (err) {
      console.error(err)
    }
    setUpdatingStatus(false)
    setStatusDropdownOpen(false)
  }

  useEffect(() => {
    if (!adminPassword) {
      setAdminUnlocked(false, undefined)
      return
    }

    async function fetchOrders() {
      try {
        const res = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${adminPassword}`
          }
        })
        if (res.ok) {
          const data = await res.json()
          setOrders(data)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    
    fetchOrders()

    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [adminPassword])

  const stats = useMemo(() => {
    return {
      total: orders.length,
      codOrders: orders.filter(o => o.payment_method === 'Cash on Delivery').length,
      processing: orders.filter(o => o.status === 'pending' || o.status === 'paid' || o.status === 'packed' || o.status === 'out_for_delivery').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        (order.users?.full_name || '').toLowerCase().includes(searchLower) ||
        (order.users?.email || '').toLowerCase().includes(searchLower) ||
        (order.order_items || []).some((item: any) => (item.products?.title || '').toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false

      if (activeTab === 'COD Orders' && order.payment_method !== 'Cash on Delivery') return false
      if ((activeTab === 'Pending' || activeTab === 'Processing') && order.status !== 'pending' && order.status !== 'paid' && order.status !== 'packed' && order.status !== 'out_for_delivery') return false
      if (activeTab === 'Shipped' && order.status !== 'shipped') return false
      if (activeTab === 'Delivered' && order.status !== 'delivered') return false
      if (activeTab === 'Cancelled' && order.status !== 'cancelled') return false

      if (paymentFilter === 'Prepaid' && order.payment_method === 'Cash on Delivery') return false
      if (paymentFilter === 'COD' && order.payment_method !== 'Cash on Delivery') return false

      return true
    })
  }, [orders, searchQuery, activeTab, paymentFilter])

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 pb-28 md:pb-8 text-gray-900 font-sans">
      
      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4 -mt-2">
        <div className="bg-white rounded-2xl p-3 flex items-center gap-2.5 border border-gray-200 shadow-2xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search Order ID or Customer..."
            className="w-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 font-bold"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-900">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {['All Orders', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'COD Orders'].map((tab) => {
            const isTabActive = activeTab === tab || (activeTab === 'Pending' && tab === 'Processing') || (activeTab === 'All Orders' && tab === 'All Orders');
            return (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab === 'Processing' ? 'Pending' : tab); setCurrentPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all shrink-0 shadow-2xs cursor-pointer ${
                  isTabActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="space-y-3 pt-1">
          {loading ? (
            <div className="py-12 text-center text-gray-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
              <span className="text-xs font-bold">Loading orders...</span>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-200 p-6 text-gray-400 text-xs italic">
              No orders match your current filters or search query.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const customerName = order.shipping_address?.name || order.users?.full_name || 'Customer';
              const itemsText = order.order_items?.map((it: any) => `${it.quantity || 1}x ${it.products?.title || 'Plant Item'}`).join(', ') || '1x Botanical Item';
              const thumbnail = order.order_items?.[0]?.products?.image_url;
              const status = order.status;
              const statusLabel = getStatusDisplayName(status).toUpperCase();
              const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'DATE N/A';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200 cursor-pointer active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-[10px] font-black text-gray-500 tracking-wider uppercase mb-0.5 font-mono">
                        #{order.id.split('-')[0].toUpperCase()}
                      </p>
                      <h4 className="text-base font-black text-gray-900 leading-tight">
                        {customerName}
                      </h4>
                    </div>

                    <div className="shrink-0">
                      <span className="bg-gray-100 text-gray-900 border border-gray-200 font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                        {statusLabel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 my-3">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center p-1">
                      {thumbnail ? (
                        <img src={thumbnail} alt="Order item" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <p className="text-xs font-semibold text-gray-600 line-clamp-2 leading-relaxed flex-1">
                      {itemsText}
                    </p>
                  </div>

                  <div className="border-t border-gray-100 my-3" />

                  <div className="flex items-end justify-between pt-0.5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-0.5">
                        {dateStr}
                      </p>
                      <p className="text-lg font-black text-gray-900 leading-none">
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-7 h-7 flex items-center justify-center text-gray-900">
                      <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2 pb-4 px-1 text-xs font-semibold text-gray-600">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-xl shadow-2xs disabled:opacity-40 font-bold text-gray-900"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 bg-white border border-gray-300 rounded-xl shadow-2xs disabled:opacity-40 font-bold text-gray-900"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Monochrome & Clean */}
      <div className="hidden md:block space-y-6">
        
        {/* 1. Monochrome Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Orders', tab: 'All Orders', value: stats.total, sub: 'All Time', icon: <Package className="w-5 h-5"/> },
            { label: 'COD Orders', tab: 'COD Orders', value: stats.codOrders, sub: 'Cash on Delivery', icon: <Filter className="w-5 h-5"/> },
            { label: 'Processing', tab: 'Pending', value: stats.processing, sub: 'In Progress', icon: <Loader2 className="w-5 h-5"/> },
            { label: 'Shipped', tab: 'Shipped', value: stats.shipped, sub: 'Dispatched', icon: <Truck className="w-5 h-5"/> },
            { label: 'Delivered', tab: 'Delivered', value: stats.delivered, sub: 'Completed', icon: <CheckCircle className="w-5 h-5"/> },
            { label: 'Cancelled', tab: 'Cancelled', value: stats.cancelled, sub: 'Refunded/Void', icon: <X className="w-5 h-5"/> },
          ].map((stat, i) => (
            <div 
              key={i} 
              onClick={() => { setActiveTab(stat.tab); setCurrentPage(1); }}
              className={`rounded-xl border p-4 shadow-2xs flex flex-col gap-2 cursor-pointer transition-all ${
                activeTab === stat.tab 
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm' 
                  : 'bg-white text-gray-900 border-gray-200/80 hover:border-emerald-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`p-2 rounded-xl ${activeTab === stat.tab ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className={`text-xs font-bold ${activeTab === stat.tab ? 'text-gray-300' : 'text-gray-500'} mb-0.5`}>{stat.label}</p>
                <h3 className="text-2xl font-black">{stat.value.toLocaleString()}</h3>
              </div>
              <p className={`text-[10px] font-bold uppercase mt-auto ${activeTab === stat.tab ? 'text-gray-400' : 'text-gray-400'}`}>{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* 2. Top Controls & Filter Bar - Exact Screenshot Style */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders or customer..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
              />
            </div>
            <select 
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 shadow-2xs outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 cursor-pointer"
            >
              <option value="All Payment Methods">All Payment Methods</option>
              <option value="Prepaid">Prepaid</option>
              <option value="COD">COD</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 shadow-2xs cursor-pointer">
              <Filter className="w-4 h-4 text-gray-600" /> Filter
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-2xs cursor-pointer">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={() => setCurrentPage(1)} className="flex items-center gap-2 px-4.5 py-2 bg-emerald-800 text-white rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all shadow-xs cursor-pointer">
              Refresh Feed
            </button>
          </div>
        </div>

        {/* Orders Table - Exact Clean Reference Style */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-emerald-800 cursor-pointer" /></th>
                  <th className="p-4 font-bold">ORDER ID</th>
                  <th className="p-4 font-bold">CUSTOMER</th>
                  <th className="p-4 font-bold">DATE</th>
                  <th className="p-4 font-bold">ITEMS SUMMARY</th>
                  <th className="p-4 font-bold">SHIPPING ADDRESS</th>
                  <th className="p-4 font-bold">AMOUNT</th>
                  <th className="p-4 font-bold">PAYMENT</th>
                  <th className="p-4 font-bold">STATUS</th>
                  <th className="p-4 pr-6 font-bold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-gray-500">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-gray-900" />
                      Loading orders feed...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-12 text-center text-gray-400 italic">
                      No matching orders found.
                    </td>
                  </tr>
                ) : paginatedOrders.map((order) => {
                  const customerName = order.users?.full_name || 'Unknown'
                  const customerEmail = order.users?.email || 'N/A'
                  const avatarLetter = customerName.charAt(0).toUpperCase()
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors group">
                      <td className="p-4 pl-6 align-top">
                        <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-emerald-800 cursor-pointer" />
                      </td>
                      <td className="p-4 align-top font-bold font-mono text-gray-900 cursor-pointer hover:underline transition-colors" onClick={() => setSelectedOrder(order)}>
                        #{order.id.split('-')[0].toUpperCase()}
                      </td>
                      <td className="p-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 flex items-center justify-center font-black text-xs shrink-0">
                            {avatarLetter}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{customerName}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-top text-gray-600 font-mono text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-4 align-top text-gray-600">
                        <div className="flex flex-col gap-2 max-w-[220px]">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2.5">
                              {item.products?.image_url && (
                                <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-100 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                                  <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                              )}
                              <div className="text-xs min-w-0">
                                <p className="font-bold text-gray-900 truncate" title={item.products?.title}>{item.products?.title}</p>
                                <p className="text-gray-400 font-semibold">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        {order.shipping_address ? (
                          <div className="text-xs text-gray-600 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 min-w-[180px] max-w-[240px] whitespace-normal">
                            <span className="font-bold text-gray-900 block mb-0.5">{order.shipping_address.name}</span>
                            <p className="leading-tight text-gray-600">{order.shipping_address.fullAddress}</p>
                            <p className="leading-tight text-gray-500 mt-0.5">{order.shipping_address.city}, {order.shipping_address.state}</p>
                            {order.shipping_address.phone && <p className="mt-1 text-gray-500 font-mono font-bold">Ph: {order.shipping_address.phone}</p>}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">N/A</span>
                        )}
                      </td>
                      <td className="p-4 align-top font-black text-gray-900 text-base">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                      <td className="p-4 align-top">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-bold text-gray-900 text-xs">{order.payment_method === 'Cash on Delivery' ? 'COD' : 'Prepaid'}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide border ${
                            order.status === 'cancelled' ? 'bg-gray-100 text-gray-600 border-gray-200 line-through' : 
                            (order.status === 'pending' || (order.payment_method === 'Cash on Delivery' && order.status !== 'delivered')) ? 'bg-gray-100 text-gray-800 border-gray-300' :
                            'bg-emerald-800 text-white border-emerald-800'
                          }`}>
                            {order.status === 'cancelled' ? 'Refunded' : (order.status === 'pending' || (order.payment_method === 'Cash on Delivery' && order.status !== 'delivered') ? 'Unpaid' : 'Verified')}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200/60' : 
                          order.status === 'cancelled' ? 'bg-gray-100 text-gray-500 border-gray-200 line-through' : 
                          'bg-emerald-800 text-white border-emerald-800'
                        }`}>
                          <span className="capitalize">{getStatusDisplayName(order.status)}</span>
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right align-top">
                        <button onClick={() => setSelectedOrder(order)} className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer" title="Inspect Order Details">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 px-6 border-t border-gray-200/80 flex items-center justify-between text-xs font-bold text-gray-500 bg-white">
            <span>Showing {((currentPage - 1) * itemsPerPage) + (paginatedOrders.length > 0 ? 1 : 0)} to {((currentPage - 1) * itemsPerPage) + paginatedOrders.length} of {filteredOrders.length} records</span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 mx-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-colors cursor-pointer ${
                      currentPage === i + 1 ? 'bg-emerald-800 text-white shadow-xs' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3.5 py-1.5 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Sidebar Overlay - Monochrome & Minimalist */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden border-l border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200/80 bg-gray-50/50">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-0.5">Order Inspection</span>
                <h2 className="text-xl font-black text-gray-900">Order Details</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-200/80">
                <span className="text-gray-500 font-bold text-sm">Order ID Number</span>
                <span className="font-black font-mono text-gray-900 text-lg">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-gray-900" /> Customer Information
                </h3>
                <div className="space-y-2 text-sm text-gray-600 bg-gray-50/60 p-4 rounded-xl border border-gray-200">
                  <p className="font-bold text-gray-900 text-base">{selectedOrder.shipping_address?.name || selectedOrder.users?.full_name}</p>
                  <p className="font-mono text-xs text-gray-500">{selectedOrder.shipping_address?.phone || '-'}</p>
                  <div className="flex gap-2 pt-2 border-t border-gray-200 mt-2 text-xs">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-500 shrink-0" />
                    <p className="leading-relaxed">{selectedOrder.shipping_address?.fullAddress},<br/>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-gray-900" /> Purchased Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50/60 rounded-xl border border-gray-200">
                      {item.products?.image_url ? (
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-gray-200 shrink-0 overflow-hidden p-1 shadow-2xs">
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-gray-200 shrink-0 shadow-2xs">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{item.products?.title || 'Product'}</p>
                        <p className="text-xs text-gray-500 mt-1 font-semibold">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-gray-900 shrink-0 text-sm">
                        ₹{Number(item.price_at_time || item.price || item.products?.price || item.products?.actual_price || (selectedOrder.total_amount ? Math.round(selectedOrder.total_amount / (item.quantity || 1)) : 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-gray-900" /> Payment Information
                </h3>
                <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-200 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-gray-900">{selectedOrder.payment_method || 'Online Payment'}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Status</span>
                    <span className="font-bold px-2 py-0.5 rounded uppercase text-[10px] tracking-widest border bg-emerald-800 text-white border-emerald-800">
                      {selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered' ? 'Pending' : 'Verified Paid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-900 font-black border-t border-gray-200 pt-3 text-base">
                    <span>Total Amount</span>
                    <span className="text-lg text-gray-900">₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Status Timeline */}
              <div className="space-y-3 pb-6">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <Truck className="w-4 h-4 text-gray-900" /> Fulfillment Timeline
                </h3>
                <div className="pl-6 space-y-6 relative mt-4 bg-gray-50/60 p-5 rounded-xl border border-gray-200">
                  <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gray-200"></div>
                  
                  {[
                    { id: 'pending', label: 'Pending', desc: 'Order received and waiting for processing' },
                    { id: 'packed', label: 'Packed', desc: 'Order items are packed safely in warehouse' },
                    { id: 'shipped', label: 'Shipped', desc: 'Dispatched to logistics delivery courier' },
                    { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier agent is arriving today' },
                    { id: 'delivered', label: 'Delivered', desc: 'Successfully delivered to shipping destination' }
                  ].map((status, index) => {
                    const statuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered']
                    const currentIndex = statuses.indexOf(selectedOrder.status)
                    const isCompleted = index <= currentIndex

                    return (
                      <div key={status.id} className="relative z-10 flex gap-4 items-start">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 bg-white ${isCompleted ? 'border-emerald-800' : 'border-gray-300'}`}>
                          {isCompleted ? <div className="w-2.5 h-2.5 bg-emerald-800 rounded-full"></div> : null}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-none ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{status.label}</p>
                          <p className={`text-xs mt-1 ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{status.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
            </div>

            {/* Update Status Footer - Monochrome Black Button */}
            <div className="p-6 border-t border-gray-200 bg-gray-50/80">
              <label className="block text-xs font-black uppercase tracking-wide text-gray-700 mb-2">Update Order Status</label>
              <div className="flex gap-3 relative">
                <div className="relative flex-1">
                  <button 
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full text-left bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 flex justify-between items-center cursor-pointer shadow-2xs hover:border-emerald-800 transition-colors"
                  >
                    <span>{getStatusDisplayName(selectedOrder.status)}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute bottom-full mb-1.5 left-0 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-20 divide-y divide-gray-100">
                      {['pending', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleUpdateStatus(selectedOrder.id, opt)}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 cursor-pointer flex items-center justify-between ${selectedOrder.status === opt ? 'bg-emerald-800 text-white font-bold' : 'text-gray-700 font-medium'}`}
                        >
                          <span>{getStatusDisplayName(opt)}</span>
                          {selectedOrder.status === opt && <CheckCircle className="w-4 h-4 text-white" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-xs disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {updatingStatus ? 'Saving...' : 'Save Status'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
