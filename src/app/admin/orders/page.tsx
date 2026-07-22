'use client'

import { useEffect, useState, useMemo } from 'react'
import { Search, Filter, MoreHorizontal, Eye, Truck, CheckCircle, Loader2, X, User, MapPin, Package, CreditCard, ChevronDown, Download, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const { adminPassword, setAdminUnlocked } = useAuthStore()

  // New states for redesign
  const [activeTab, setActiveTab] = useState('All Orders')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [paymentFilter, setPaymentFilter] = useState('All Payment Methods')

  // Export to CSV function
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

    // Real-time subscription
    const channel = supabase.channel('realtime_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        fetchOrders()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [adminPassword])

  // Computed Statistics
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

  // Filtering Logic
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch = 
        order.id.toLowerCase().includes(searchLower) ||
        (order.users?.full_name || '').toLowerCase().includes(searchLower) ||
        (order.users?.email || '').toLowerCase().includes(searchLower) ||
        (order.order_items || []).some((item: any) => (item.products?.title || '').toLowerCase().includes(searchLower))
      
      if (!matchesSearch) return false

      // Tab
      if (activeTab === 'COD Orders' && order.payment_method !== 'Cash on Delivery') return false
      if (activeTab === 'Pending' && order.status !== 'pending' && order.status !== 'paid' && order.status !== 'packed' && order.status !== 'out_for_delivery') return false
      if (activeTab === 'Shipped' && order.status !== 'shipped') return false
      if (activeTab === 'Delivered' && order.status !== 'delivered') return false
      if (activeTab === 'Cancelled' && order.status !== 'cancelled') return false

      // Payment Filter
      if (paymentFilter === 'Prepaid' && order.payment_method === 'Cash on Delivery') return false
      if (paymentFilter === 'COD' && order.payment_method !== 'Cash on Delivery') return false

      return true
    })
  }, [orders, searchQuery, activeTab, paymentFilter])

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      
      {/* 1. Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Orders', tab: 'All Orders', value: stats.total, sub: 'All Time', icon: <Package className="w-5 h-5 text-purple-500"/>, bg: 'bg-purple-50' },
          { label: 'COD Orders', tab: 'COD Orders', value: stats.codOrders, sub: 'Cash on Delivery', icon: <Filter className="w-5 h-5 text-yellow-500"/>, bg: 'bg-yellow-50' },
          { label: 'Pending', tab: 'Pending', value: stats.processing, sub: 'In Progress', icon: <Loader2 className="w-5 h-5 text-yellow-500"/>, bg: 'bg-yellow-50' },
          { label: 'Shipped', tab: 'Shipped', value: stats.shipped, sub: 'Shipped', icon: <Truck className="w-5 h-5 text-emerald-500"/>, bg: 'bg-emerald-50' },
          { label: 'Delivered', tab: 'Delivered', value: stats.delivered, sub: 'Completed', icon: <CheckCircle className="w-5 h-5 text-green-500"/>, bg: 'bg-green-50' },
          { label: 'Cancelled', tab: 'Cancelled', value: stats.cancelled, sub: 'Cancelled Orders', icon: <X className="w-5 h-5 text-red-500"/>, bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div 
            key={i} 
            onClick={() => { setActiveTab(stat.tab); setCurrentPage(1); }}
            className={`bg-white rounded-xl border p-4 shadow-sm flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
              activeTab === stat.tab ? 'border-[#1A73E8] ring-2 ring-[#1A73E8]/20 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-0.5">{stat.label}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
            </div>
            <p className="text-[10px] text-gray-400 font-medium uppercase mt-auto">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* 2. Tabs */}
      <div className="bg-white border-b border-gray-200 shadow-sm rounded-t-xl overflow-x-auto flex">
        {['All Orders', 'COD Orders', 'Pending', 'Shipped', 'Delivered', 'Cancelled'].map(tab => {
          const isActive = activeTab === tab
          let count = 0
          if(tab === 'All Orders') count = stats.total
          if(tab === 'COD Orders') count = stats.codOrders
          if(tab === 'Pending') count = stats.processing
          if(tab === 'Shipped') count = stats.shipped
          if(tab === 'Delivered') count = stats.delivered
          if(tab === 'Cancelled') count = stats.cancelled
          
          return (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={`px-6 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                isActive ? 'border-[#1A73E8] text-[#1A73E8]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab} {count > 0 && <span className="text-xs font-normal opacity-70 ml-1">({count})</span>}
            </button>
          )
        })}
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white border-x border-b border-gray-200 p-4 flex flex-col lg:flex-row gap-4 justify-between items-center -mt-6">
        <div className="flex flex-wrap gap-3 items-center w-full lg:w-auto">
          {/* Date Range Placeholder */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span>01/05/2024 - 31/05/2024</span>
              <ChevronDown className="w-4 h-4 text-gray-400 ml-2" />
            </div>
          </div>
          {/* Status Filter Placeholder */}
          <select 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white outline-none"
          >
            <option>All Status</option>
          </select>
          {/* Payment Method Filter */}
          <select 
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 bg-white outline-none"
          >
            <option value="All Payment Methods">All Payment Methods</option>
            <option value="Prepaid">Prepaid</option>
            <option value="COD">COD</option>
          </select>
          {/* Filters Button */}
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex gap-3 w-full lg:w-auto justify-end">
          {/* Search Input added to top bar for convenience */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none text-sm"
            />
          </div>
          <button onClick={exportToCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-sm font-bold hover:bg-[#1557B0] transition-colors">
            Sort By <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-b-xl border-x border-b border-gray-200 shadow-sm overflow-hidden -mt-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                <th className="p-4 font-semibold">Order ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Items</th>
                <th className="p-4 font-semibold">Shipping</th>
                <th className="p-4 font-semibold">Total Amount</th>
                <th className="p-4 font-semibold">Payment</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading orders...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : paginatedOrders.map((order) => {
                const customerName = order.users?.full_name || 'Unknown'
                const customerEmail = order.users?.email || 'N/A'
                const avatarLetter = customerName.charAt(0).toUpperCase()
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="p-4 font-medium text-[#1A73E8] cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                      {order.id.split('-')[0]}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-[#1A73E8] flex items-center justify-center font-bold text-xs shrink-0">
                          {avatarLetter}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500">{customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex flex-col gap-2 max-w-[200px]">
                        {order.order_items?.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            {item.products?.image_url && (
                              <img src={item.products.image_url} alt={item.products.title} className="w-8 h-8 object-cover rounded-md bg-gray-100 shrink-0" />
                            )}
                            <div className="text-xs">
                              <p className="font-medium text-gray-900 truncate" title={item.products?.title}>{item.products?.title}</p>
                              <p className="text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      {order.shipping_address ? (
                        <div className="text-xs text-gray-600 min-w-[200px] max-w-[250px] whitespace-normal">
                          <span className="font-medium text-gray-900 block mb-1">{order.shipping_address.name}</span>
                          <p className="leading-tight">{order.shipping_address.fullAddress}</p>
                          <p className="leading-tight">{order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}</p>
                          {order.shipping_address.phone && <p className="mt-1 text-gray-500 font-medium">Ph: {order.shipping_address.phone}</p>}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-gray-900">₹{order.total_amount}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-bold text-gray-900">{order.payment_method === 'Cash on Delivery' ? 'COD' : 'Prepaid'}</span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200' : 
                          (order.status === 'pending' || (order.payment_method === 'Cash on Delivery' && order.status !== 'delivered')) ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-green-50 text-green-700 border border-green-200'
                        }`}>
                          {order.status === 'cancelled' ? 'Refunded' : (order.status === 'pending' || (order.payment_method === 'Cash on Delivery' && order.status !== 'delivered') ? 'Pending' : 'Paid')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'paid' ? 'bg-yellow-100 text-yellow-800' : 
                        order.status === 'packed' ? 'bg-indigo-100 text-indigo-800' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' : 
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'packed' && <Package className="w-3 h-3" />}
                        {order.status === 'shipped' && <Truck className="w-3 h-3" />}
                        {order.status === 'out_for_delivery' && <Truck className="w-3 h-3" />}
                        {order.status === 'delivered' && <CheckCircle className="w-3 h-3" />}
                        {order.status === 'cancelled' && <X className="w-3 h-3" />}
                        <span className="capitalize">{order.status === 'pending' ? 'COD Order' : order.status === 'paid' ? 'Pending' : order.status.replace(/_/g, ' ')}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="hidden md:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-gray-500 hover:text-[#1A73E8] border border-gray-200 hover:border-[#1A73E8] rounded-md transition-colors" title="View Details"><Eye className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => setSelectedOrder(order)} className="text-gray-400 hover:text-gray-600 md:group-hover:hidden cursor-pointer"><MoreHorizontal className="w-5 h-5 ml-auto" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500 bg-white">
          <span>Showing {((currentPage - 1) * itemsPerPage) + (paginatedOrders.length > 0 ? 1 : 0)} to {((currentPage - 1) * itemsPerPage) + paginatedOrders.length} of {filteredOrders.length} orders</span>
          <div className="flex gap-2 items-center">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium cursor-pointer"
            >
              Previous
            </button>
            <div className="flex items-center gap-1 mx-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold transition-colors cursor-pointer ${
                    currentPage === i + 1 ? 'bg-[#1A73E8] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Sidebar Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex justify-end">
          {/* Sidebar */}
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Order ID</span>
                <span className="font-bold text-[#1A73E8] text-lg">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
              </div>

              {/* Customer Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-gray-400" /> Customer Information
                </h3>
                <div className="pl-6 space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{selectedOrder.shipping_address?.name || selectedOrder.users?.full_name}</p>
                  <p>{selectedOrder.shipping_address?.phone}</p>
                  <div className="flex gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                    <p>{selectedOrder.shipping_address?.fullAddress},<br/>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-gray-400" /> Product Information
                </h3>
                <div className="pl-6 space-y-4">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      {item.products?.image_url ? (
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden">
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm leading-tight">{item.products?.title}</p>
                        <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-gray-900 shrink-0">
                        ₹{(item.price_at_time || item.price || item.products?.price || item.products?.actual_price || (selectedOrder.total_amount ? Math.round(selectedOrder.total_amount / (item.quantity || 1)) : 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-gray-400" /> Payment Information
                </h3>
                <div className="pl-6 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-medium text-gray-900">{selectedOrder.payment_method || 'Online Payment'}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Status</span>
                    <span className={`font-bold px-2 py-0.5 rounded uppercase text-[10px] tracking-widest border ${
                      selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered'
                        ? 'text-yellow-600 bg-yellow-50 border-yellow-200' 
                        : 'text-green-600 bg-green-50 border-green-200'
                    }`}>
                      {selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered' ? 'Pending' : 'Paid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-900 font-bold border-t border-gray-100 pt-3">
                    <span>Total Amount</span>
                    <span className="text-lg">₹{selectedOrder.total_amount}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Status Timeline */}
              <div className="space-y-4 pb-8">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  Shipping Status
                </h3>
                <div className="pl-6 space-y-6 relative mt-4">
                  <div className="absolute left-8 top-2 bottom-2 w-0.5 bg-gray-100"></div>
                  
                  {[
                    { id: 'pending', label: 'Pending', desc: 'Order is received' },
                    { id: 'packed', label: 'Packed', desc: 'Order is packed and ready to ship' },
                    { id: 'shipped', label: 'Shipped', desc: 'Order has been shipped' },
                    { id: 'out_for_delivery', label: 'Out for Delivery', desc: 'Order is out for delivery' },
                    { id: 'delivered', label: 'Delivered', desc: 'Order has been delivered' }
                  ].map((status, index) => {
                    const statuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered']
                    const currentIndex = statuses.indexOf(selectedOrder.status)
                    const isCompleted = index <= currentIndex
                    const isActive = index === currentIndex

                    return (
                      <div key={status.id} className="relative z-10 flex gap-4">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 bg-white ${isCompleted ? 'border-[#1A73E8]' : 'border-gray-200'}`}>
                          {isCompleted ? <div className="w-2.5 h-2.5 bg-[#1A73E8] rounded-full"></div> : null}
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{status.label}</p>
                          <p className={`text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-400'}`}>{status.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
            </div>

            {/* Update Status Footer */}
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <label className="block text-xs font-bold text-gray-700 mb-2">Update Status</label>
              <div className="flex gap-3 relative">
                <div className="relative flex-1">
                  <button 
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="w-full text-left bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex justify-between items-center cursor-pointer"
                  >
                    <span className="capitalize">{selectedOrder.status === 'paid' ? 'Pending' : selectedOrder.status.replace(/_/g, ' ')}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {statusDropdownOpen && (
                    <div className="absolute bottom-full mb-1 left-0 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                      {['pending', 'paid', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            handleUpdateStatus(selectedOrder.id, opt)
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize cursor-pointer ${selectedOrder.status === opt ? 'bg-blue-50 text-[#1A73E8] font-medium' : 'text-gray-700'}`}
                        >
                          {opt === 'paid' ? 'Pending' : opt.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button 
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder.id, selectedOrder.status)} // Just a visual update button, actually handles change in dropdown
                  className="bg-[#D81B60] hover:bg-[#C2185B] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  {updatingStatus ? '...' : 'Update'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

