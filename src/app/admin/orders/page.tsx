'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Filter, Download, Loader2, X, User, MapPin, Package, CreditCard, ChevronDown, ChevronRight, Eye, Truck, CheckCircle } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
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
    <div className="space-y-6 pb-28 md:pb-8 text-stone-800 font-sans max-w-full">
      <div className="hidden md:block">
        <h1 className="text-2xl md:text-2xl font-black tracking-tighter text-stone-800 mb-2">Transactions</h1>
        <p className="text-sm md:text-base text-stone-500 max-w-[65ch]">
          Search, filter, update fulfillment status, and export every order.
        </p>
      </div>
      
      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4 -mt-2">
        <div className="bg-white rounded-3xl p-3 flex items-center gap-2.5 border border-stone-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <Search className="w-4 h-4 text-stone-400 shrink-0" strokeWidth={1.5} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search Order ID or Customer..."
            className="w-full bg-transparent border-none outline-none text-sm text-stone-800 placeholder:text-stone-400 font-bold"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-800">
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
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                  isTabActive
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 border-[#1B4332] shadow-[0_4px_14px_rgba(0,0,0,0.1)]'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-[#1B4332]/5'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="space-y-4 pt-2">
          {loading ? (
            <div className="py-12 text-center text-stone-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-stone-800" strokeWidth={1.5} />
              <span className="text-xs font-bold">Loading...</span>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-3xl border border-stone-200 p-6 text-stone-400 text-xs italic shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              No orders match your current filters.
            </div>
          ) : (
            paginatedOrders.map((order) => {
              const customerName = order.shipping_address?.name || order.users?.full_name || 'Customer';
              const itemsText = order.order_items?.map((it: any) => `${it.quantity || 1}x ${it.products?.title || 'Item'}`).join(', ') || '1x Item';
              const thumbnail = order.order_items?.[0]?.products?.image_url;
              const status = order.status;
              const statusLabel = getStatusDisplayName(status).toUpperCase();
              const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : 'DATE N/A';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white rounded-3xl p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-200 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 tracking-wider uppercase mb-1">
                        #{order.id.split('-')[0].toUpperCase()}
                      </p>
                      <h4 className="text-lg font-black tracking-tight text-stone-800 leading-tight">
                        {customerName}
                      </h4>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xs">
                      {statusLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-4 p-3 bg-[#F9F9F8] rounded-2xl border border-stone-200">
                    <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center p-1 shadow-xs">
                      {thumbnail ? (
                        <img src={thumbnail} alt="Order item" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                      )}
                    </div>
                    <p className="text-xs font-bold text-stone-600 line-clamp-2 leading-relaxed flex-1">
                      {itemsText}
                    </p>
                  </div>

                  <div className="flex items-end justify-between mt-4 pt-4 border-t border-stone-200">
                    <div>
                      <p className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mb-1">
                        {dateStr}
                      </p>
                      <p className="text-2xl font-black tracking-tighter text-stone-800 leading-none">
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-[#F9F9F8] border border-stone-200 rounded-full flex items-center justify-center text-stone-800 shadow-xs">
                      <ChevronRight className="w-5 h-5 stroke-[2]" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-4 px-1 text-xs font-bold text-stone-500">
            <span>Pg {currentPage} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-xs disabled:opacity-40 text-stone-800"
              >
                Prev
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-stone-200 rounded-xl shadow-xs disabled:opacity-40 text-stone-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP VIEW - Soft Structuralism */}
      <div className="hidden md:block space-y-5">
        
        {/* Statistics Cards */}
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
              className={`rounded-xl border p-6 flex flex-col gap-4 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                activeTab === stat.tab 
                  ? 'bg-amber-50 text-amber-700 border border-amber-200 border-[#1B4332] shadow-[0_8px_30px_rgba(0,0,0,0.15)] scale-105 z-10' 
                  : 'bg-white text-stone-800 border-stone-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-stone-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === stat.tab ? 'bg-white/10 text-white' : 'bg-stone-50 text-stone-800 border border-stone-200'}`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === stat.tab ? 'text-stone-400' : 'text-stone-400'} mb-1`}>{stat.label}</p>
                <h3 className="text-2xl font-black tracking-tighter">{stat.value.toLocaleString()}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Top Controls & Filter Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-stone-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
              <input 
                type="text" 
                placeholder="Search orders or customer..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 bg-[#F9F9F8] border border-stone-200 rounded-2xl focus:border-[#1B4332]/20 focus:ring-1 focus:ring-[#1B4332]/20 outline-none text-sm font-bold text-stone-800 placeholder-gray-400 transition-all"
              />
            </div>
            <select 
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-[#F9F9F8] border border-stone-200 rounded-2xl text-sm font-bold text-stone-800 outline-none hover:bg-[#1B4332]/5 transition-colors cursor-pointer"
            >
              <option value="All Payment Methods">All Methods</option>
              <option value="Prepaid">Prepaid</option>
              <option value="COD">COD</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-[#F9F9F8] border border-stone-200 rounded-2xl text-sm font-bold text-stone-800 hover:bg-[#1B4332]/5 transition-colors cursor-pointer">
              <Download className="w-4 h-4" strokeWidth={1.5} /> Export
            </button>
            <button onClick={() => setCurrentPage(1)} className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl text-sm font-bold hover:scale-[0.98] hover:shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-all cursor-pointer">
              Refresh Feed
            </button>
          </div>
        </div>

        {/* Orders Table - Double-Bezel */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
              <thead>
                <tr className="bg-[#F9F9F8] border-b border-stone-200 text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                  <th className="p-3 pl-4 w-12"><input type="checkbox" className="rounded border-stone-300 text-stone-800 cursor-pointer" /></th>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Summary</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">State</th>
                  <th className="p-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-black/5 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-500">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-stone-400" strokeWidth={1.5} />
                      <span className="font-bold">Syncing ledgers...</span>
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-400 italic font-bold">
                      No matching records found.
                    </td>
                  </tr>
                ) : paginatedOrders.map((order) => {
                  const customerName = order.users?.full_name || 'Unknown'
                  const customerEmail = order.users?.email || 'N/A'
                  const avatarLetter = customerName.charAt(0).toUpperCase()
                  
                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition-colors group">
                      <td className="p-3 pl-4 align-top">
                        <input type="checkbox" className="rounded border-stone-300 text-stone-800 cursor-pointer" />
                      </td>
                      <td className="p-3 align-top">
                        <span className="font-bold font-mono text-stone-800 cursor-pointer hover:underline" onClick={() => setSelectedOrder(order)}>
                          #{order.id.split('-')[0].toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center font-black text-xs text-stone-800 shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                            {avatarLetter}
                          </div>
                          <div>
                            <p className="font-bold text-stone-800">{customerName}</p>
                            <p className="text-xs text-stone-500 mt-0.5">{customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 align-top text-stone-600 font-bold text-xs">
                        {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 align-top text-stone-600">
                        <div className="flex flex-col gap-3 max-w-[220px]">
                          {order.order_items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3">
                              {item.products?.image_url && (
                                <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 p-1 shrink-0 overflow-hidden flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                                  <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                                </div>
                              )}
                              <div className="text-xs min-w-0">
                                <p className="font-bold text-stone-800 truncate" title={item.products?.title}>{item.products?.title}</p>
                                <p className="text-stone-400 font-bold mt-0.5">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 align-top">
                        {order.shipping_address ? (
                          <div className="text-xs text-stone-600 min-w-[180px] max-w-[240px] whitespace-normal">
                            <span className="font-bold text-stone-800 block mb-1">{order.shipping_address.name}</span>
                            <p className="leading-relaxed text-stone-500">{order.shipping_address.city}, {order.shipping_address.state}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic font-bold">Digital</span>
                        )}
                      </td>
                      <td className="p-3 align-top font-black tracking-tight text-stone-800 text-base">₹{Number(order.total_amount).toLocaleString('en-IN')}</td>
                      <td className="p-3 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                            order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                            order.status === 'cancelled' ? 'bg-stone-50 text-stone-400 line-through' : 
                            'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs'
                          }`}>
                            <span className="capitalize">{getStatusDisplayName(order.status)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-3 pr-4 text-right align-top">
                        <button onClick={() => setSelectedOrder(order)} className="p-2.5 text-stone-400 hover:text-[#1B4332] bg-[#F9F9F8] border border-stone-200 rounded-xl transition-all cursor-pointer shadow-xs">
                          <Eye className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-3 px-8 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-stone-500 bg-[#F9F9F8]">
            <span>Showing {((currentPage - 1) * itemsPerPage) + (paginatedOrders.length > 0 ? 1 : 0)} to {((currentPage - 1) * itemsPerPage) + paginatedOrders.length} of {filteredOrders.length} records</span>
            <div className="flex gap-2 items-center">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-stone-200 bg-white rounded-xl hover:bg-stone-50 hover:text-stone-800 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
              >
                Previous
              </button>
              <div className="flex items-center gap-1 mx-3">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-colors cursor-pointer ${
                      currentPage === i + 1 ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-xs' : 'text-stone-500 hover:bg-[#1B4332]/5'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 border border-stone-200 bg-white rounded-xl hover:bg-stone-50 hover:text-stone-800 disabled:opacity-40 transition-colors cursor-pointer shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Sidebar Overlay - Soft Structuralism */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#1B4332]/20 backdrop-blur-sm transition-opacity" onClick={() => setSelectedOrder(null)} />
          <div className="w-full max-w-lg bg-white h-full shadow-[0_0_60px_rgba(0,0,0,0.1)] flex flex-col relative z-10 animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-stone-200">
            <div className="flex items-center justify-between p-5 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 block mb-1">Inspection</span>
                <h2 className="text-2xl font-black tracking-tighter text-stone-800">Order Details</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-[#F9F9F8] border border-stone-200 text-stone-400 hover:text-stone-800 rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-10">
              
              <div className="flex justify-between items-end pb-6 border-b border-stone-200">
                <span className="text-[11px] font-bold uppercase tracking-widest text-stone-400">Order Ref</span>
                <span className="font-black font-mono tracking-tight text-stone-800 text-2xl">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-widest">
                  <User className="w-4 h-4 text-[#1B4332]" strokeWidth={1.5} /> Customer
                </h3>
                <div className="bg-[#F9F9F8] p-6 rounded-2xl border border-stone-200">
                  <p className="font-black text-stone-800 text-lg mb-1">{selectedOrder.shipping_address?.name || selectedOrder.users?.full_name}</p>
                  <p className="font-bold text-sm text-stone-500">{selectedOrder.shipping_address?.phone || '-'}</p>
                  <div className="flex gap-3 pt-4 mt-4 border-t border-stone-200 text-sm font-medium text-stone-600">
                    <MapPin className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" strokeWidth={1.5} />
                    <p className="leading-relaxed">{selectedOrder.shipping_address?.fullAddress},<br/>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-widest">
                  <Package className="w-4 h-4 text-[#1B4332]" strokeWidth={1.5} /> Line Items
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-stone-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                      {item.products?.image_url ? (
                        <div className="w-12 h-12 rounded-xl bg-[#F9F9F8] flex items-center justify-center border border-stone-200 shrink-0 overflow-hidden p-2">
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-[#F9F9F8] flex items-center justify-center border border-stone-200 shrink-0">
                          <Package className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm leading-tight truncate">{item.products?.title || 'Product'}</p>
                        <p className="text-[11px] uppercase tracking-widest font-bold text-stone-400 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-stone-800 shrink-0 text-base">
                        ₹{Number(item.price_at_time || item.price || item.products?.price || item.products?.actual_price || (selectedOrder.total_amount ? Math.round(selectedOrder.total_amount / (item.quantity || 1)) : 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-stone-400 flex items-center gap-2 uppercase tracking-widest">
                  <CreditCard className="w-4 h-4 text-[#1B4332]" strokeWidth={1.5} /> Ledger
                </h3>
                <div className="bg-[#F9F9F8] p-6 rounded-2xl border border-stone-200 space-y-4 text-sm font-bold text-stone-600">
                  <div className="flex justify-between items-center">
                    <span>Method</span>
                    <span className="text-stone-800">{selectedOrder.payment_method || 'Online'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest border ${selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered' ? 'bg-white text-stone-800 border-stone-200' : 'bg-amber-50 text-amber-700 border border-amber-200 border-[#1B4332]'}`}>
                      {selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered' ? 'Unpaid' : 'Verified'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-800 border-t border-stone-200 pt-4">
                    <span>Total Amount</span>
                    <span className="text-2xl font-black tracking-tighter">₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Update Status Footer */}
            <div className="p-5 border-t border-stone-200 bg-white">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3">Modify State</label>
              <div className="flex gap-4 relative">
                <div className="relative flex-1">
                  <button 
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full text-left bg-[#F9F9F8] border border-stone-200 rounded-2xl px-3 py-2 text-sm font-bold text-stone-800 flex justify-between items-center cursor-pointer hover:bg-[#1B4332]/5 transition-colors"
                  >
                    <span>{getStatusDisplayName(selectedOrder.status)}</span>
                    <ChevronDown className="w-5 h-5 text-stone-400" strokeWidth={1.5} />
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-full bg-white border border-stone-200 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] overflow-hidden z-20 py-2">
                      {['pending', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleUpdateStatus(selectedOrder.id, opt)}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-[#1B4332]/5 cursor-pointer flex items-center justify-between ${selectedOrder.status === opt ? 'font-black text-[#1B4332]' : 'text-stone-600 font-bold'}`}
                        >
                          <span>{getStatusDisplayName(opt)}</span>
                          {selectedOrder.status === opt && <CheckCircle className="w-4 h-4 text-[#1B4332]" strokeWidth={2} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)}
                  className="bg-[#1B4332] hover:scale-[0.98] text-white px-4 py-2 rounded-2xl font-bold text-sm transition-transform shadow-[0_4px_20px_rgba(0,0,0,0.15)] disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {updatingStatus ? 'Syncing...' : 'Commit'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
