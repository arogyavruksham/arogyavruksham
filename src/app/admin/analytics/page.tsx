'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, TrendingUp, ShoppingBag, PackageCheck, Loader2, Tag, 
  CheckCircle2, Clock, Calendar, ChevronRight, X, Eye, DollarSign, 
  Users, Truck, ArrowUpRight, User, MapPin, Package, CreditCard
} from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts'

type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  actual_price_at_time: number
  price_at_time?: number
  products?: any
}

type Order = {
  id: string
  user_id: string
  total_amount: number
  status: string
  shipping_address: any
  coupon_code?: string
  discount_amount?: number
  payment_method?: string
  created_at: string
  order_items?: OrderItem[]
  users?: any
}

type DailyStat = {
  dateStr: string
  formattedDate: string
  totalOrders: number
  deliveredOrders: number
  revenue: number
  cost: number
  profit: number
  orders: Order[]
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    completedOrders: 0,
    pendingOrders: 0,
    deliveringOrders: 0,
    totalProfit: 0,
    couponsUsed: 0
  })

  const [dailyStats, setDailyStats] = useState<DailyStat[]>([])
  const [overallTimeStats, setOverallTimeStats] = useState<any[]>([])
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        // Fetch orders
        const { data: orders, error: ordersError } = await adminDbProxy({ 
          action: 'select', 
          table: 'orders',
          order: { column: 'created_at', ascending: false }
        })
        if (ordersError) throw ordersError

        // Fetch order items to calculate cost
        const { data: orderItems, error: itemsError } = await adminDbProxy({ action: 'select', table: 'order_items' })
        if (itemsError) throw itemsError

        // Fetch products and users for enrichment
        const { data: products } = await adminDbProxy({ action: 'select', table: 'products' })
        const { data: users } = await adminDbProxy({ action: 'select', table: 'users' })

        const enrichedOrders: Order[] = (orders || []).map((order: any) => {
          const user = users?.find((u: any) => u.id === order.user_id)
          const items = orderItems?.filter((i: any) => i.order_id === order.id).map((i: any) => {
            const product = products?.find((p: any) => p.id === i.product_id)
            return {
              ...i,
              price_at_time: i.actual_price_at_time || i.price_at_time,
              products: product || { title: 'Product', image_url: '' }
            }
          })
          return {
            ...order,
            users: user,
            order_items: items || []
          }
        })

        let completed = 0
        let pending = 0
        let delivering = 0
        let coupons = 0
        let revenue = 0
        let cost = 0

        const dailyMap: { [key: string]: DailyStat } = {}
        const timeMap = Array.from({ length: 24 }, (_, i) => {
          const label = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
          return { hour: i, time: label, orders: 0, revenue: 0 }
        })

        enrichedOrders.forEach((order: Order) => {
          if (order.status === 'delivered') completed++
          if (order.status === 'pending') pending++
          if (order.status === 'shipped') delivering++
          if (order.coupon_code) coupons++

          const orderAmount = Number(order.total_amount || 0)
          if (order.status !== 'cancelled') {
            revenue += orderAmount
          }

          // Date processing
          if (order.created_at) {
            const dateObj = new Date(order.created_at)
            if (!isNaN(dateObj.getTime())) {
              // Time graph distribution
              const hour = dateObj.getHours()
              timeMap[hour].orders += 1
              if (order.status !== 'cancelled') {
                timeMap[hour].revenue += orderAmount
              }

              // Daily grouping
              const year = dateObj.getFullYear()
              const month = String(dateObj.getMonth() + 1).padStart(2, '0')
              const day = String(dateObj.getDate()).padStart(2, '0')
              const dateStr = `${year}-${month}-${day}`

              if (!dailyMap[dateStr]) {
                const formatted = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                dailyMap[dateStr] = {
                  dateStr,
                  formattedDate: formatted,
                  totalOrders: 0,
                  deliveredOrders: 0,
                  revenue: 0,
                  cost: 0,
                  profit: 0,
                  orders: []
                }
              }

              dailyMap[dateStr].totalOrders += 1
              if (order.status === 'delivered') {
                dailyMap[dateStr].deliveredOrders += 1
              }
              if (order.status !== 'cancelled') {
                dailyMap[dateStr].revenue += orderAmount
              }
              dailyMap[dateStr].orders.push(order)
            }
          }
        })

        // Calculate item costs
        orderItems?.forEach((item: any) => {
          const order = enrichedOrders.find((o: Order) => o.id === item.order_id)
          if (order && order.status !== 'cancelled' && order.created_at) {
            const itemCost = Number(item.actual_price_at_time || 0) * Number(item.quantity || 1)
            cost += itemCost

            const dateObj = new Date(order.created_at)
            if (!isNaN(dateObj.getTime())) {
              const year = dateObj.getFullYear()
              const month = String(dateObj.getMonth() + 1).padStart(2, '0')
              const day = String(dateObj.getDate()).padStart(2, '0')
              const dateStr = `${year}-${month}-${day}`
              if (dailyMap[dateStr]) {
                dailyMap[dateStr].cost += itemCost
              }
            }
          }
        })

        // Compute profit for each day
        const dailyArray = Object.values(dailyMap).map(day => ({
          ...day,
          profit: day.revenue - day.cost
        })).sort((a, b) => b.dateStr.localeCompare(a.dateStr))

        const profit = revenue - cost

        setStats({
          completedOrders: completed,
          pendingOrders: pending,
          deliveringOrders: delivering,
          totalProfit: profit,
          couponsUsed: coupons
        })

        setDailyStats(dailyArray)
        setOverallTimeStats(timeMap)

      } catch (e) {
        console.error("Error fetching analytics:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const selectedDayData = selectedDateStr ? dailyStats.find(d => d.dateStr === selectedDateStr) : null

  // Compute time distribution for selected day
  const selectedDayTimeStats = selectedDayData ? Array.from({ length: 24 }, (_, i) => {
    const label = i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`
    return { hour: i, time: label, orders: 0 }
  }) : []

  if (selectedDayData) {
    selectedDayData.orders.forEach(order => {
      const d = new Date(order.created_at)
      if (!isNaN(d.getTime())) {
        const h = d.getHours()
        selectedDayTimeStats[h].orders += 1
      }
    })
  }

  // Compute status breakdown for selected day
  const selectedDayStatusStats = selectedDayData ? [
    { name: 'Delivered', value: selectedDayData.orders.filter(o => o.status === 'delivered').length, color: '#10B981' },
    { name: 'Shipped', value: selectedDayData.orders.filter(o => o.status === 'shipped').length, color: '#3B82F6' },
    { name: 'Pending', value: selectedDayData.orders.filter(o => o.status === 'pending').length, color: '#F59E0B' },
    { name: 'Cancelled', value: selectedDayData.orders.filter(o => o.status === 'cancelled').length, color: '#EF4444' }
  ].filter(s => s.value > 0) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#51D3B7]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 shadow-inner">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Net Profit</p>
            <h3 className="text-3xl font-bold text-gray-900">₹{stats.totalProfit.toLocaleString('en-IN')}</h3>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1 font-semibold">
              <BarChart3 className="w-3.5 h-3.5" /> Real-time tracking
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Completed Orders</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.completedOrders}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">Successfully delivered</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-inner">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Delivering (Shipped)</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.deliveringOrders}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">On the way to customers</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center shrink-0 shadow-inner">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">Awaiting processing</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-all">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-inner">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Coupons Used</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.couponsUsed}</h3>
            <p className="text-xs text-gray-400 mt-2 font-medium">Orders with discounts applied</p>
          </div>
        </div>

      </div>

      {/* Global Peak Order Times Graph */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#51D3B7]" /> Overall Order Time Analysis
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Analyses order placement times across the entire store history</p>
          </div>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">24-Hour Breakdown</span>
        </div>

        <div className="h-72 w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overallTimeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#51D3B7" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#51D3B7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} interval={2} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ stroke: '#f1f5f9', strokeWidth: 2, strokeDasharray: '3 3' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                formatter={(value: any) => [`${value} Orders`, 'Order Count']}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#51D3B7" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorOrders)" 
                dot={{ r: 3, fill: '#fff', stroke: '#51D3B7', strokeWidth: 2 }} 
                activeDot={{ r: 6, fill: '#51D3B7', stroke: '#fff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Analytics Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#51D3B7]" /> Daily Analytics & Performance
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Click on any date to inspect deep insights, graphs, and complete order logs for that day</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6">Date</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Delivers (Delivered)</th>
                <th className="p-4">Not Delivered</th>
                <th className="p-4">Total Income</th>
                <th className="p-4">Net Profit</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm font-medium">
              {dailyStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 italic">No daily order data recorded yet.</td>
                </tr>
              ) : dailyStats.map(day => (
                <tr 
                  key={day.dateStr} 
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
                >
                  <td className="p-4 pl-6 font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400 group-hover:text-[#51D3B7] transition-colors" />
                    {day.formattedDate}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg font-bold text-xs">
                      {day.totalOrders}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg font-bold text-xs flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {day.deliveredOrders}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg font-bold text-xs flex items-center gap-1 w-fit">
                      <Clock className="w-3.5 h-3.5" /> {day.totalOrders - day.deliveredOrders}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    ₹{day.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 font-bold text-green-600">
                    ₹{day.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDateStr(day.dateStr); }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#51D3B7]/10 text-[#2db395] hover:bg-[#51D3B7] hover:text-white font-bold text-xs transition-all shadow-sm"
                    >
                      Inspect Date <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Date Deep-Dive Modal */}
      {selectedDayData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-6 px-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 sticky top-0 z-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#51D3B7] block mb-1">Daily Deep-Dive Analytics</span>
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-gray-700" /> {selectedDayData.formattedDate}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-8 overflow-y-auto space-y-8 flex-1">
              
              {/* Daily Metrics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Orders</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{selectedDayData.totalOrders}</p>
                </div>
                <div className="bg-green-50/60 p-4 rounded-2xl border border-green-100">
                  <p className="text-xs font-bold text-green-700 uppercase">Delivers (Delivered)</p>
                  <p className="text-2xl font-black text-green-800 mt-1">{selectedDayData.deliveredOrders}</p>
                </div>
                <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-100">
                  <p className="text-xs font-bold text-orange-700 uppercase">Not Delivered</p>
                  <p className="text-2xl font-black text-orange-800 mt-1">{selectedDayData.totalOrders - selectedDayData.deliveredOrders}</p>
                </div>
                <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
                  <p className="text-xs font-bold text-blue-700 uppercase">Day Revenue</p>
                  <p className="text-2xl font-black text-blue-900 mt-1">₹{selectedDayData.revenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-700 uppercase">Net Day Profit</p>
                  <p className="text-2xl font-black text-emerald-800 mt-1">₹{selectedDayData.profit.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Graphs Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Hourly Time Orders Graph for this day */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#51D3B7]" /> Order Time Graph ({selectedDayData.formattedDate})
                  </h4>
                  <p className="text-xs text-gray-500 mb-6">Analyses exact order placement times across the 24 hours of this day</p>
                  
                  <div className="h-60 w-full min-h-[240px] flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedDayTimeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} interval={3} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: '#f8fafc' }} 
                          contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0' }}
                          formatter={(value: any) => [`${value} Orders`, 'Placed']}
                        />
                        <Bar dataKey="orders" fill="#51D3B7" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Day Status Breakdown Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                  <h4 className="font-bold text-gray-900 mb-1">Status Breakdown</h4>
                  <p className="text-xs text-gray-500 mb-6">Proportion of order fulfillment</p>
                  
                  <div className="h-60 w-full min-h-[240px] flex-1 flex items-center justify-center">
                    {selectedDayStatusStats.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No order status data</p>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={selectedDayStatusStats}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {selectedDayStatusStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(val: any) => [`${val} Orders`, 'Count']} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* Complete Order Logs Table for this Day */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-5 bg-gray-50/60 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                      <ShoppingBag className="w-4 h-4 text-[#51D3B7]" /> All Order Logs for {selectedDayData.formattedDate}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Click any row below to view full customer, product & payment info</p>
                  </div>
                  <span className="text-xs font-bold text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-200">
                    {selectedDayData.orders.length} Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="p-3.5 pl-5">Time</th>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Customer Name</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5 text-right pr-5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {selectedDayData.orders.map((order: any) => {
                        const timeStr = order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
                        return (
                          <tr 
                            key={order.id} 
                            onClick={() => setSelectedOrder(order)}
                            className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                          >
                            <td className="p-3.5 pl-5 text-gray-500 font-mono">{timeStr}</td>
                            <td className="p-3.5 font-bold font-mono text-[#1A73E8]">#{order.id.slice(0, 8).toUpperCase()}</td>
                            <td className="p-3.5 font-bold text-gray-900">{order.shipping_address?.name || order.users?.full_name || 'Customer'}</td>
                            <td className="p-3.5 text-gray-600">{order.payment_method || 'Online'}</td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                                order.status === 'delivered' ? 'bg-green-50 text-green-600' :
                                order.status === 'pending' ? 'bg-yellow-50 text-yellow-600' :
                                order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3.5 font-bold text-gray-900">
                              ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex items-center gap-1 text-[#51D3B7] font-bold group-hover:translate-x-0.5 transition-transform">
                                <Eye className="w-4 h-4" /> View
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-8 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close Deep-Dive
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Order Details Sidebar Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#51D3B7] block">Order Inspection</span>
                <h2 className="text-xl font-black text-gray-900">Order Details</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-500 font-medium text-sm">Order ID</span>
                <span className="font-bold font-mono text-[#1A73E8] text-lg">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
              </div>

              {/* Customer Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-[#51D3B7]" /> Customer Information
                </h3>
                <div className="pl-6 space-y-1.5 text-sm text-gray-600 bg-gray-50/60 p-4 rounded-2xl border border-gray-100">
                  <p className="font-bold text-gray-900 text-base">{selectedOrder.shipping_address?.name || selectedOrder.users?.full_name || 'Customer'}</p>
                  <p className="font-mono text-xs text-gray-500">{selectedOrder.shipping_address?.phone || '-'}</p>
                  {selectedOrder.shipping_address?.fullAddress && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200/60 mt-2 text-xs">
                      <MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" />
                      <p>{selectedOrder.shipping_address.fullAddress},<br/>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-[#51D3B7]" /> Product Information
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-3 bg-gray-50/60 rounded-2xl border border-gray-100 items-center">
                      {item.products?.image_url ? (
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-gray-100 shrink-0 overflow-hidden shadow-sm">
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply p-1" />
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center border border-gray-100 shrink-0 shadow-sm">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 text-sm leading-tight truncate">{item.products?.title || 'Product'}</p>
                        <p className="text-xs text-gray-500 mt-1 font-medium">Qty: {item.quantity}</p>
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
                  <CreditCard className="w-4 h-4 text-[#51D3B7]" /> Payment Information
                </h3>
                <div className="bg-gray-50/60 p-4 rounded-2xl border border-gray-100 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-gray-900">{selectedOrder.payment_method || 'Online Payment'}</span>
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
                  <div className="flex justify-between items-center text-gray-900 font-black border-t border-gray-200/60 pt-3 text-base">
                    <span>Total Amount</span>
                    <span className="text-lg text-[#1A73E8]">₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Status Timeline */}
              <div className="space-y-3 pb-8">
                <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 uppercase tracking-wider">
                  <Truck className="w-4 h-4 text-[#51D3B7]" /> Shipping Status
                </h3>
                <div className="pl-6 space-y-6 relative mt-4 bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                  <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gray-200"></div>
                  
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

                    return (
                      <div key={status.id} className="relative z-10 flex gap-4 items-start">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 bg-white ${isCompleted ? 'border-[#1A73E8]' : 'border-gray-300'}`}>
                          {isCompleted ? <div className="w-2.5 h-2.5 bg-[#1A73E8] rounded-full"></div> : null}
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

            {/* Modal Close Footer */}
            <div className="p-4 px-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-gray-900 text-white font-bold text-sm rounded-xl hover:bg-gray-800 transition-colors shadow-sm w-full"
              >
                Close Order Inspection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
