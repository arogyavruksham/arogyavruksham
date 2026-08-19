'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, TrendingUp, ShoppingBag, PackageCheck, Loader2, Tag, 
  CheckCircle2, Clock, Calendar, ChevronRight, X, Eye, DollarSign, 
  Users, Truck, ArrowUpRight, User, MapPin, Package, CreditCard, Info, ChevronDown
} from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
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
  const [activeTab, setActiveTab] = useState('Overview')
  const [filterOption, setFilterOption] = useState('All orders & sales')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const { data: orders, error: ordersError } = await adminDbProxy({ 
          action: 'select', 
          table: 'orders',
          order: { column: 'created_at', ascending: false }
        })
        if (ordersError) throw ordersError

        const { data: orderItems, error: itemsError } = await adminDbProxy({ action: 'select', table: 'order_items' })
        if (itemsError) throw itemsError

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

          if (order.created_at) {
            const dateObj = new Date(order.created_at)
            if (!isNaN(dateObj.getTime())) {
              const hour = dateObj.getHours()
              timeMap[hour].orders += 1
              if (order.status !== 'cancelled') {
                timeMap[hour].revenue += orderAmount
              }

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
        if (dailyArray.length) {
          setRangeStart(dailyArray[dailyArray.length - 1].dateStr)
          setRangeEnd(dailyArray[0].dateStr)
        }

      } catch (e) {
        console.error("Error fetching analytics:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const selectedDayData = selectedDateStr ? dailyStats.find(d => d.dateStr === selectedDateStr) : null

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

  const selectedDayStatusStats = selectedDayData ? [
    { name: 'Delivered', value: selectedDayData.orders.filter(o => o.status === 'delivered').length, color: '#059669' },
    { name: 'Shipped', value: selectedDayData.orders.filter(o => o.status === 'shipped').length, color: '#34d399' },
    { name: 'Pending', value: selectedDayData.orders.filter(o => o.status === 'pending').length, color: '#a7f3d0' },
    { name: 'Cancelled', value: selectedDayData.orders.filter(o => o.status === 'cancelled').length, color: '#f1f5f9' }
  ].filter(s => s.value > 0) : []

  const filteredDailyStats = dailyStats.filter((day) => {
    if (rangeStart && day.dateStr < rangeStart) return false
    if (rangeEnd && day.dateStr > rangeEnd) return false
    return true
  })

  const rangeOrders = filteredDailyStats.flatMap((d) => d.orders).filter((order) => {
    if (filterOption === 'Completed only') return order.status === 'delivered'
    if (filterOption === 'Pending deliveries') return order.status !== 'delivered' && order.status !== 'cancelled'
    if (filterOption === 'Discounts applied') return Boolean(order.coupon_code)
    return true
  })

  const uniqueCustomers = new Set(
    rangeOrders.map((o) => o.user_id || o.shipping_address?.phone || o.users?.email || o.id)
  ).size

  const couponOrders = rangeOrders.filter((o) => o.coupon_code)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-800" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full text-stone-800 pb-16 font-sans">
      
      <AdminPageHeader
        eyebrow="Overview"
        title="Analytics"
        description="Filter by date and tab to inspect profit, customers, order times, and coupon usage."
        actions={
          <div className="flex items-center gap-2 bg-white border border-stone-300 rounded-xl px-3 py-2 shadow-2xs">
            <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="text-sm font-bold text-stone-800 outline-none bg-transparent" />
            <span className="text-stone-400">—</span>
            <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="text-sm font-bold text-stone-800 outline-none bg-transparent" />
            <Calendar className="w-4 h-4 text-stone-500" />
          </div>
        }
      />

      {/* Horizontal Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-stone-200 overflow-x-auto text-sm no-scrollbar">
        {[
          'Overview', 
          'Transactions & Orders', 
          'Customers & Users', 
          'Order Times', 
          'Daily Performance', 
          'Offers & Coupons'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              activeTab === tab 
                ? 'text-[#1B4332] border-[#1B4332] font-black' 
                : 'text-stone-400 border-transparent hover:text-stone-700 hover:border-stone-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Dropdown */}
      <div className="pt-1">
        <div className="inline-block relative">
          <select 
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="appearance-none bg-white border border-stone-300 text-stone-800 text-sm font-semibold rounded-xl pl-4 pr-10 py-2 shadow-2xs outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] cursor-pointer"
          >
            <option value="All orders & sales">All orders & sales</option>
            <option value="Completed only">Completed only</option>
            <option value="Pending deliveries">Pending deliveries</option>
            <option value="Discounts applied">Discounts applied</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
        </div>
        <span className="ml-3 text-xs font-semibold text-stone-500">{rangeOrders.length} orders in range</span>
      </div>

      {activeTab === 'Customers & Users' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-3 border border-stone-200">
            <p className="text-sm font-semibold text-stone-500">Unique customers</p>
            <p className="text-2xl font-black mt-2">{uniqueCustomers}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-stone-200">
            <p className="text-sm font-semibold text-stone-500">Orders in range</p>
            <p className="text-2xl font-black mt-2">{rangeOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-stone-200">
            <p className="text-sm font-semibold text-stone-500">Avg. order value</p>
            <p className="text-2xl font-black mt-2">
              ₹{rangeOrders.length ? Math.round(rangeOrders.reduce((s, o) => s + Number(o.total_amount || 0), 0) / rangeOrders.length).toLocaleString('en-IN') : 0}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'Offers & Coupons' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-3 border border-stone-200">
            <p className="text-sm font-semibold text-stone-500">Orders with a coupon</p>
            <p className="text-2xl font-black mt-2">{couponOrders.length}</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-stone-200">
            <p className="text-sm font-semibold text-stone-500">Coupon usage rate</p>
            <p className="text-2xl font-black mt-2">
              {rangeOrders.length ? Math.round((couponOrders.length / rangeOrders.length) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Metric Cards - Monochrome White & Black */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Net Profit */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-sm font-semibold">
            <span>Total Net Profit</span>
            <span title="Calculated revenue minus total product acquisition cost" className="cursor-help text-emerald-500 hover:text-emerald-700 bg-[#F9F9F8] p-1 rounded-full">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-2xl font-black text-stone-800">
              ₹{stats.totalProfit.toLocaleString('en-IN')}
            </h3>
            <span className="text-xs text-stone-500 font-semibold mt-1 block">Live profit tracking</span>
          </div>
        </div>

        {/* Card 2: Completed Orders */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-sm font-semibold">
            <span>Completed Orders</span>
            <span title="Orders successfully delivered to customer" className="cursor-help text-emerald-500 hover:text-emerald-700 bg-[#F9F9F8] p-1 rounded-full">
              <PackageCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-2xl font-black text-stone-800">
              {stats.completedOrders}
            </h3>
            <span className="text-xs text-stone-500 font-semibold mt-1 block">Fully delivered</span>
          </div>
        </div>

        {/* Card 3: Delivering (Shipped) */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-sm font-semibold">
            <span>In Delivery / Shipped</span>
            <span title="Orders currently dispatched and in transit" className="cursor-help text-emerald-500 hover:text-emerald-700 bg-[#F9F9F8] p-1 rounded-full">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-2xl font-black text-stone-800">
              {stats.deliveringOrders}
            </h3>
            <span className="text-xs text-stone-500 font-semibold mt-1 block">In active transit</span>
          </div>
        </div>

        {/* Card 4: Coupons Used */}
        <div className="bg-white rounded-xl p-3 border border-stone-200 shadow-2xs flex flex-col justify-between hover:border-[#1B4332] transition-colors">
          <div className="flex items-center justify-between text-stone-500 text-sm font-semibold">
            <span>Coupons Applied</span>
            <span title="Total transactions utilizing promotional discount vouchers" className="cursor-help text-emerald-500 hover:text-emerald-700 bg-[#F9F9F8] p-1 rounded-full">
              <Tag className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl md:text-2xl font-black text-stone-800">
              {stats.couponsUsed}
            </h3>
            <span className="text-xs text-stone-500 font-semibold mt-1 block">Promotions active</span>
          </div>
        </div>

      </div>

      {/* Info Notice Banner */}
      <div className="bg-emerald-100 border border-emerald-200 rounded-xl p-3 px-4 text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
        <Info className="w-4 h-4 text-emerald-700 shrink-0" />
        <span>Visibility is limited to data generated on or after <strong className="font-black text-emerald-950 underline">November 22, 2023</strong>.</span>
      </div>

      {(activeTab === 'Overview' || activeTab === 'Order Times') && (
      <div className="bg-white p-6 rounded-xl shadow-2xs border border-stone-200 mt-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
          <div>
            <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-stone-800" /> Overall Order Time Analysis
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Analyses order placement times across the entire store history</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold rounded-full">24-Hour Breakdown</span>
        </div>

        <div className="h-72 w-full min-h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={overallTimeStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} dy={10} interval={2} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip 
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3' }} 
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                formatter={(value: any) => [`${value} Orders`, 'Order Count']}
              />
              <Area 
                type="monotone" 
                dataKey="orders" 
                stroke="#059669" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorOrders)" 
                dot={{ r: 3, fill: '#fff', stroke: '#059669', strokeWidth: 2 }} 
                activeDot={{ r: 5, fill: '#059669', stroke: '#fff', strokeWidth: 2 }} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {(activeTab === 'Overview' || activeTab === 'Daily Performance' || activeTab === 'Transactions & Orders') && (
      <div className="bg-white rounded-xl shadow-2xs border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200 flex justify-between items-center bg-[#F9F9F8]">
          <div>
            <h2 className="text-lg font-black text-stone-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-stone-800" /> Daily Analytics & Performance
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">Click on any date to inspect deep insights, graphs, and complete order logs for that day</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-[#F9F9F8] border-b border-stone-200 text-xs uppercase tracking-wider text-stone-500 font-semibold">
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
              {filteredDailyStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-5 text-center text-stone-400 italic">No daily order data recorded yet.</td>
                </tr>
              ) : filteredDailyStats.map(day => (
                <tr 
                  key={day.dateStr} 
                  onClick={() => setSelectedDateStr(day.dateStr)}
                  className="hover:bg-[#F9F9F8]/80 cursor-pointer transition-colors group"
                >
                  <td className="p-4 pl-6 font-bold text-stone-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-stone-500 group-hover:text-stone-800 transition-colors" />
                    {day.formattedDate}
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg font-bold text-xs">
                      {day.totalOrders}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-800 border border-stone-200 rounded-lg font-semibold text-xs flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" /> {day.deliveredOrders}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-600 border border-stone-200 rounded-lg font-semibold text-xs flex items-center gap-1 w-fit">
                      <Clock className="w-3.5 h-3.5 text-stone-400" /> {day.totalOrders - day.deliveredOrders}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-stone-800">
                    ₹{day.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 font-black text-stone-800">
                    ₹{day.profit.toLocaleString('en-IN')}
                  </td>
                  <td className="p-4 text-right pr-6">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedDateStr(day.dateStr); }}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-gray-900 font-bold text-xs transition-all shadow-xs"
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
      )}

      {/* Date Deep-Dive Modal */}
      {selectedDayData && (
        <div className="fixed inset-0 bg-[#1B4332]/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-stone-200">
            
            <div className="p-6 px-8 border-b border-stone-200 flex justify-between items-center bg-[#F9F9F8]/80 sticky top-0 z-10">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-stone-800 block mb-1">Daily Deep-Dive Analytics</span>
                <h3 className="text-2xl font-black text-stone-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-stone-800" /> {selectedDayData.formattedDate}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="p-2 text-stone-400 hover:text-stone-800 hover:bg-gray-200/60 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-[#F9F9F8] p-4 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-500 uppercase">Total Orders</p>
                  <p className="text-2xl font-black text-stone-800 mt-1">{selectedDayData.totalOrders}</p>
                </div>
                <div className="bg-[#F9F9F8] p-4 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-500 uppercase">Delivered</p>
                  <p className="text-2xl font-black text-stone-800 mt-1">{selectedDayData.deliveredOrders}</p>
                </div>
                <div className="bg-[#F9F9F8] p-4 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-500 uppercase">Not Delivered</p>
                  <p className="text-2xl font-black text-stone-800 mt-1">{selectedDayData.totalOrders - selectedDayData.deliveredOrders}</p>
                </div>
                <div className="bg-[#F9F9F8] p-4 rounded-xl border border-stone-200">
                  <p className="text-xs font-bold text-stone-500 uppercase">Day Revenue</p>
                  <p className="text-2xl font-black text-stone-800 mt-1">₹{selectedDayData.revenue.toLocaleString('en-IN')}</p>
                </div>
                <div className="bg-amber-50 text-amber-700 border border-amber-200 p-4 rounded-xl">
                  <p className="text-xs font-black text-gray-300 uppercase">Net Day Profit</p>
                  <p className="text-2xl font-black text-white mt-1">₹{selectedDayData.profit.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-stone-200 shadow-2xs flex flex-col">
                  <h4 className="font-bold text-stone-800 mb-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-stone-800" /> Order Time Graph ({selectedDayData.formattedDate})
                  </h4>
                  <p className="text-xs text-stone-500 mb-6">Analyses exact order placement times across the 24 hours of this day</p>
                  
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
                        <Bar dataKey="orders" fill="#059669" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-2xs flex flex-col">
                  <h4 className="font-bold text-stone-800 mb-1">Status Breakdown</h4>
                  <p className="text-xs text-stone-500 mb-6">Proportion of order fulfillment</p>
                  
                  <div className="h-60 w-full min-h-[240px] flex-1 flex items-center justify-center">
                    {selectedDayStatusStats.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No order status data</p>
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

              <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="p-3 bg-[#F9F9F8]/60 border-b border-stone-200 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-stone-800 flex items-center gap-2 text-sm">
                      <ShoppingBag className="w-4 h-4 text-stone-800" /> All Order Logs for {selectedDayData.formattedDate}
                    </h4>
                    <p className="text-[11px] text-stone-500 mt-0.5">Click any row below to view full customer, product & payment info</p>
                  </div>
                  <span className="text-xs font-bold text-stone-700 bg-white px-2.5 py-1 rounded-full border border-stone-200">
                    {selectedDayData.orders.length} Records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                    <thead>
                      <tr className="bg-[#F9F9F8] border-b border-stone-200 text-stone-500 uppercase font-semibold tracking-wider">
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
                            className="hover:bg-[#F9F9F8] cursor-pointer transition-colors group"
                          >
                            <td className="p-3.5 pl-5 text-stone-500 font-mono">{timeStr}</td>
                            <td className="p-3.5 font-bold font-mono text-stone-800">#{order.id.slice(0, 8).toUpperCase()}</td>
                            <td className="p-3.5 font-bold text-stone-800">{order.shipping_address?.name || order.users?.full_name || 'Customer'}</td>
                            <td className="p-3.5 text-stone-600">{order.payment_method || 'Online'}</td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] bg-stone-100 text-stone-800 border border-stone-200">
                                {order.status}
                              </span>
                            </td>
                            <td className="p-3.5 font-black text-stone-800">
                              ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                            </td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex items-center gap-1 text-stone-800 font-bold group-hover:underline">
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

            <div className="p-4 px-8 border-t border-stone-200 bg-[#F9F9F8] flex justify-end">
              <button 
                onClick={() => setSelectedDateStr(null)}
                className="px-6 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-sm rounded-xl hover:bg-gray-900 transition-colors shadow-xs cursor-pointer"
              >
                Close Deep-Dive
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Order Details Sidebar Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-[#1B4332]/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden border-l border-stone-200">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 bg-[#F9F9F8]">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-800 block">Order Inspection</span>
                <h2 className="text-xl font-black text-stone-800">Order Details</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-gray-200/60 transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="flex justify-between items-center pb-4 border-b border-stone-200">
                <span className="text-stone-500 font-medium text-sm">Order ID</span>
                <span className="font-bold font-mono text-stone-800 text-lg">#{selectedOrder.id.split('-')[0].toUpperCase()}</span>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <User className="w-4 h-4 text-stone-800" /> Customer Information
                </h3>
                <div className="pl-6 space-y-1.5 text-sm text-stone-600 bg-[#F9F9F8]/60 p-4 rounded-xl border border-stone-200">
                  <p className="font-bold text-stone-800 text-base">{selectedOrder.shipping_address?.name || selectedOrder.users?.full_name || 'Customer'}</p>
                  <p className="font-mono text-xs text-stone-500">{selectedOrder.shipping_address?.phone || '-'}</p>
                  {selectedOrder.shipping_address?.fullAddress && (
                    <div className="flex gap-2 pt-2 border-t border-stone-200 mt-2 text-xs">
                      <MapPin className="w-4 h-4 mt-0.5 text-stone-500 shrink-0" />
                      <p>{selectedOrder.shipping_address.fullAddress},<br/>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.pincode}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <Package className="w-4 h-4 text-stone-800" /> Product Information
                </h3>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-3 bg-[#F9F9F8]/60 rounded-xl border border-stone-200 items-center">
                      {item.products?.image_url ? (
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-stone-200 shrink-0 overflow-hidden shadow-2xs">
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply p-1" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-stone-200 shrink-0 shadow-2xs">
                          <Package className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-stone-800 text-sm leading-tight truncate">{item.products?.title || 'Product'}</p>
                        <p className="text-xs text-stone-500 mt-1 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <div className="font-black text-stone-800 shrink-0 text-sm">
                        ₹{Number(item.price_at_time || item.price || item.products?.price || item.products?.actual_price || (selectedOrder.total_amount ? Math.round(selectedOrder.total_amount / (item.quantity || 1)) : 0)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <CreditCard className="w-4 h-4 text-stone-800" /> Payment Information
                </h3>
                <div className="bg-[#F9F9F8]/60 p-4 rounded-xl border border-stone-200 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Payment Method</span>
                    <span className="font-bold text-stone-800">{selectedOrder.payment_method || 'Online Payment'}</span>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Payment Status</span>
                    <span className="font-bold px-2 py-0.5 rounded uppercase text-[10px] tracking-widest border bg-amber-50 text-amber-700 border border-amber-200 border-[#1B4332]">
                      {selectedOrder.payment_method === 'Cash on Delivery' && selectedOrder.status !== 'delivered' ? 'Pending' : 'Paid'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-800 font-black border-t border-stone-200 pt-3 text-base">
                    <span>Total Amount</span>
                    <span className="text-lg text-stone-800">₹{Number(selectedOrder.total_amount || 0).toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pb-8">
                <h3 className="text-xs font-bold text-stone-400 flex items-center gap-2 uppercase tracking-wider">
                  <Truck className="w-4 h-4 text-stone-800" /> Shipping Status
                </h3>
                <div className="pl-6 space-y-6 relative mt-4 bg-[#F9F9F8]/60 p-3 rounded-xl border border-stone-200">
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 bg-white ${isCompleted ? 'border-[#1B4332]' : 'border-stone-300'}`}>
                          {isCompleted ? <div className="w-2.5 h-2.5 bg-[#1B4332] rounded-full"></div> : null}
                        </div>
                        <div>
                          <p className={`text-sm font-bold leading-none ${isCompleted ? 'text-stone-800' : 'text-stone-400'}`}>{status.label}</p>
                          <p className={`text-xs mt-1 ${isCompleted ? 'text-stone-500' : 'text-stone-400'}`}>{status.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
            </div>

            <div className="p-4 px-6 border-t border-stone-200 bg-[#F9F9F8] flex justify-end">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 font-bold text-sm rounded-xl hover:bg-gray-900 transition-colors shadow-xs w-full cursor-pointer"
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
