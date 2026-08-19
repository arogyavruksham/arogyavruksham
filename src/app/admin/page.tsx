'use client'

import { TrendingUp, Users, Package, ShoppingBag, ArrowUpRight, Loader2, MapPin, Info, Sparkles, BarChart2, Bot, Archive, ShoppingCart, LayoutGrid, Tag, Megaphone, Mail, Settings, ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { adminDbProxy } from '@/lib/admin-proxy'
import { filterNavForRole } from '@/lib/admin-nav'
import { getLocalSubscribers } from '@/lib/newsletter'
import { getStoreSettings } from '@/lib/store-settings'
import { useAuthStore } from '@/store/authStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const SECTION_ICONS: Record<string, any> = {
  Sparkles, BarChart2, Bot, Package, Archive, ShoppingCart, LayoutGrid, Tag, Megaphone, Mail, Users, Settings,
}

const PIE_COLORS = ['#000000', '#F3F4F6'];

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingDelivery: 0
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [activeCoupons, setActiveCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [salesData, setSalesData] = useState<any[]>([])
  const [targetData, setTargetData] = useState<any[]>([])
  const [chartTotals, setChartTotals] = useState({ income: 0, expenses: 0, balance: 0 })

  const [globalDateFilter, setGlobalDateFilter] = useState('Last 30 Days')
  const [salesMonthFilter, setSalesMonthFilter] = useState('')
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  
  const [allDailyData, setAllDailyData] = useState<any[]>([])
  const [allValidOrders, setAllValidOrders] = useState<any[]>([])
  const [monthlyTarget, setMonthlyTarget] = useState(145000)
  const [sectionCounts, setSectionCounts] = useState<Record<string, string>>({})
  const { user } = useAuthStore()

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: ordersData } = await adminDbProxy({
        action: 'select',
        table: 'orders',
        select: 'id, total_amount, status, created_at, user_id, shipping_address, users (full_name, email)',
        order: { column: 'created_at', ascending: false }
      })

      const { data: orderItemsData } = await adminDbProxy({
        action: 'select',
        table: 'order_items',
        select: 'product_id, quantity'
      })

      if (ordersData) {
        const validOrders = ordersData.filter((o: any) => o.status !== 'cancelled')
        setAllValidOrders(validOrders)
        setRecentOrders(ordersData.slice(0, 5))

        const { data: dailyData } = await adminDbProxy({
          action: 'select',
          table: 'daily_analytics',
          order: { column: 'date', ascending: true }
        })
          
        let finalDailyData: any[] = []
        if (dailyData && dailyData.length > 0) {
          finalDailyData = dailyData
        } else {
          const salesByDate: Record<string, any> = {};
          validOrders.forEach((o: any) => {
            const dateStr = new Date(o.created_at).toISOString().split('T')[0];
            if (!salesByDate[dateStr]) {
              salesByDate[dateStr] = { date: dateStr, total_income: 0, total_expenses: 0, total_orders: 0, total_customers: new Set() };
            }
            salesByDate[dateStr].total_income += Number(o.total_amount);
            salesByDate[dateStr].total_expenses += Number(o.total_amount) * 0.4;
            salesByDate[dateStr].total_orders += 1;
            salesByDate[dateStr].total_customers.add(o.user_id);
          });
          finalDailyData = Object.values(salesByDate).map(d => ({
            ...d,
            total_customers: d.total_customers.size
          })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        }
        
        setAllDailyData(finalDailyData)

        const monthsSet = new Set<string>()
        finalDailyData.forEach(d => {
          const monthStr = new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          monthsSet.add(monthStr)
        })
        const monthsArray = Array.from(monthsSet).reverse()
        setAvailableMonths(monthsArray.length > 0 ? monthsArray : ['Jul 2023'])
        if (!salesMonthFilter) setSalesMonthFilter(monthsArray[0] || 'Jul 2023')
      }

      if (orderItemsData && orderItemsData.length > 0) {
        const productSalesCount: Record<string, number> = {};
        orderItemsData.forEach((item: any) => {
          productSalesCount[item.product_id] = (productSalesCount[item.product_id] || 0) + item.quantity;
        });
        
        const topProductIds = Object.keys(productSalesCount)
          .sort((a,b) => productSalesCount[b] - productSalesCount[a])
          .slice(0, 4);

        if (topProductIds.length > 0) {
          const { data: topProductsData } = await adminDbProxy({
            action: 'select',
            table: 'products'
          })

          if (topProductsData) {
            const filteredProducts = topProductsData.filter((p: any) => topProductIds.includes(p.id));
            const formatted = filteredProducts.map((p: any) => ({
              ...p, 
              sales_count: productSalesCount[p.id]
            }));
            formatted.sort((a: any,b: any) => b.sales_count - a.sales_count);
            setTopProducts(formatted);
          }
        }
      } else {
        const { data: productsData } = await adminDbProxy({
          action: 'select',
          table: 'products'
        })
        if (productsData) setTopProducts(productsData.slice(0, 4).map((p: any) => ({...p, sales_count: 0})));
      }

      const { data: couponsData } = await adminDbProxy({
        action: 'select',
        table: 'coupons',
        match: { is_active: true },
        order: { column: 'expiry_date', ascending: true }
      })

      if (couponsData) {
        setActiveCoupons(couponsData.slice(0, 3));
      }

      const { data: usersData } = await adminDbProxy({ action: 'select', table: 'users' }).catch(() => ({ data: [] }))
      const { data: allProducts } = await adminDbProxy({ action: 'select', table: 'products' }).catch(() => ({ data: [] }))
      const settings = getStoreSettings()
      setMonthlyTarget(settings.monthlyTarget || 145000)
      const productCount = (allProducts || topProducts || []).length
      const lowStock = (allProducts || []).filter((p: any) => Number(p.stock_count) <= (settings.lowStockThreshold || 10)).length
      const subscriberCount = getLocalSubscribers().length
      const orderCount = (ordersData || []).length
      const pendingCount = (ordersData || []).filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled').length

      setSectionCounts({
        '/admin': `${orderCount} orders`,
        '/admin/analytics': 'Live reports',
        '/admin/ai-summary': 'Today’s insights',
        '/admin/products': `${productCount} products`,
        '/admin/inventory': `${lowStock} need restock`,
        '/admin/orders': `${pendingCount} open`,
        '/admin/categories': 'Shop filters',
        '/admin/offers': `${(couponsData || []).length} coupons`,
        '/admin/announcement': 'Store banner',
        '/admin/newsletter': `${subscriberCount} subscribers`,
        '/admin/customers': `${(usersData || []).length} users`,
        '/admin/settings': 'Store setup',
      })

      setLoading(false)
    }

    fetchDashboardData()
  }, [])

  useEffect(() => {
    if (!allValidOrders.length) return;
    const now = new Date().getTime()
    let cutoff = 0
    if (globalDateFilter === 'Last 7 Days') cutoff = now - 7 * 24 * 60 * 60 * 1000
    else if (globalDateFilter === 'Last 30 Days') cutoff = now - 30 * 24 * 60 * 60 * 1000
    else if (globalDateFilter === 'This Month') {
      const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); cutoff = d.getTime();
    }

    const filteredOrders = allValidOrders.filter(o => new Date(o.created_at).getTime() >= cutoff)
    
    setMetrics({
      totalSales: filteredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      totalOrders: filteredOrders.length,
      totalCustomers: new Set(filteredOrders.map(o => o.user_id || o.users?.email || o.id)).size,
      pendingDelivery: filteredOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length
    })
  }, [globalDateFilter, allValidOrders])

  useEffect(() => {
    if (!allDailyData.length || !salesMonthFilter) return;
    
    const filteredDays = allDailyData.filter(d => {
      const monthStr = new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
      return monthStr === salesMonthFilter
    })

    let totalIncome = 0;
    let totalExpenses = 0;

    const newSalesData = filteredDays.map(d => {
      totalIncome += Number(d.total_income);
      totalExpenses += Number(d.total_expenses);
      return {
        name: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        income: Number(d.total_income),
        expenses: Number(d.total_expenses)
      };
    });
    
    setSalesData(newSalesData);
    setChartTotals({
      income: totalIncome,
      expenses: totalExpenses,
      balance: totalIncome - totalExpenses
    });

    const remaining = Math.max(0, monthlyTarget - totalIncome);
    setTargetData([
      { name: 'Achieved', value: totalIncome > 0 ? totalIncome : 1 },
      { name: 'Remaining', value: remaining }
    ]);
  }, [salesMonthFilter, allDailyData, monthlyTarget])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-300" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className="space-y-12 max-w-full font-sans text-gray-900 pb-24">
      
      {/* Header & Global Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-black/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gray-900">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-2 max-w-[65ch]">
            Overview of store performance, catalog status, and active operations.
          </p>
        </div>
        <select 
          value={globalDateFilter}
          onChange={(e) => setGlobalDateFilter(e.target.value)}
          className="bg-[#FCFCFD] border border-black/5 text-gray-900 text-sm font-bold rounded-2xl px-5 py-3 outline-none hover:bg-black/5 transition-colors cursor-pointer"
        >
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="This Month">This Month</option>
          <option value="All Time">All Time</option>
        </select>
      </div>

      {/* Metric Cards - Soft Structuralism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col justify-between h-48 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Revenue</span>
            <div className="w-10 h-10 bg-[#F7F7F8] rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter text-gray-900 mb-1">₹{metrics.totalSales.toLocaleString('en-IN')}</p>
            <span className="inline-flex items-center text-[10px] font-bold text-gray-400 tracking-wide uppercase">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +14.2% Growth
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col justify-between h-48 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Total Orders</span>
            <div className="w-10 h-10 bg-[#F7F7F8] rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter text-gray-900 mb-1">{metrics.totalOrders}</p>
            <span className="inline-flex items-center text-[10px] font-bold text-gray-400 tracking-wide uppercase">
              <ArrowUpRight className="w-3 h-3 mr-1" /> +8.4% Velocity
            </span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col justify-between h-48 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Unique Users</span>
            <div className="w-10 h-10 bg-[#F7F7F8] rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <Users className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter text-gray-900 mb-1">{metrics.totalCustomers}</p>
            <span className="inline-flex items-center text-[10px] font-bold text-gray-400 tracking-wide uppercase">
              <ArrowUpRight className="w-3 h-3 mr-1" /> Retention Stable
            </span>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col justify-between h-48 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Fulfillment</span>
            <div className="w-10 h-10 bg-[#F7F7F8] rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
              <Package className="w-5 h-5" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-4xl font-black tracking-tighter text-gray-900 mb-1">{metrics.pendingDelivery}</p>
            <span className="inline-flex items-center text-[10px] font-bold text-orange-500 tracking-wide uppercase">
              Action Required
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row - Monochrome / Black & White */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales Analytic Chart */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-gray-900">Revenue Velocity</h2>
            <select 
              value={salesMonthFilter}
              onChange={(e) => setSalesMonthFilter(e.target.value)}
              className="bg-[#FCFCFD] border border-black/5 text-gray-900 font-bold text-sm rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-black/5 transition-colors"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-6 sm:gap-10 mb-10 pb-8 border-b border-black/5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Total Income</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter text-gray-900">₹{chartTotals.income.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-2">Est. Expenses</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter text-gray-400">₹{chartTotals.expenses.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-900 mb-2">Net Balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black tracking-tighter text-black">₹{chartTotals.balance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 600 }} />
                <Tooltip cursor={{ stroke: '#e5e7eb', strokeWidth: 1.5, strokeDasharray: '3 3', fill: 'transparent' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontWeight: 'bold' }} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#000" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  dot={{ r: 4, fill: '#fff', stroke: '#000', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#000', stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Target Donut */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 flex flex-col">
          <h2 className="text-2xl font-black tracking-tighter text-gray-900 mb-8">Target Quota</h2>
          
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {targetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full mt-8 space-y-5 bg-[#FCFCFD] p-6 rounded-2xl border border-black/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Daily Mark</span>
                </div>
                <div className="font-bold text-gray-900 text-sm">
                  ₹5,000
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-black"></div>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-gray-900">Monthly</span>
                </div>
                <div className="flex items-center gap-1 font-black text-gray-900 text-base">
                  <ArrowUpRight className="w-4 h-4" /> ₹{monthlyTarget.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Active Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Top Selling Products - Bento Style */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 lg:col-span-2">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-gray-900">Top Performing</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCFCFD] border border-black/5 text-gray-400 hover:text-black transition-colors">&larr;</button>
              <button className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCFCFD] border border-black/5 text-gray-400 hover:text-black transition-colors">&rarr;</button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topProducts.map((product) => (
              <div key={product.id} className="group flex flex-col p-4 bg-[#FCFCFD] border border-black/5 rounded-2xl hover:bg-black/5 transition-colors cursor-pointer">
                <div className="bg-white rounded-xl aspect-square mb-4 p-4 flex items-center justify-center overflow-hidden border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" strokeWidth={1.5} />
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate mb-2">{product.title || product.name}</h4>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-sm font-black tracking-tight text-gray-900">₹{product.price}</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">{product.sales_count} Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Offer */}
        <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black tracking-tighter text-gray-900">Campaigns</h2>
            <a href="/admin/offers" className="w-10 h-10 rounded-full flex items-center justify-center bg-[#FCFCFD] border border-black/5 hover:bg-black/5 transition-colors">
              <ChevronRight className="w-5 h-5 text-gray-600" strokeWidth={1.5} />
            </a>
          </div>

          <div className="space-y-4">
            {activeCoupons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active campaigns.</p>
            ) : activeCoupons.map(coupon => {
              const start = new Date(coupon.start_date).getTime();
              const end = new Date(coupon.expiry_date).getTime();
              const now = Date.now();
              const totalDuration = end - start;
              const elapsed = now - start;
              let progress = 0;
              
              if (now < start) progress = 0;
              else if (now > end) progress = 100;
              else progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

              const isUpcoming = now < start;
              const isExpired = now > end;

              return (
                <div key={coupon.id} className="p-5 bg-[#FCFCFD] rounded-2xl border border-black/5">
                  <div className="flex justify-between items-center text-sm mb-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">{coupon.title}</span>
                      {!isExpired && !isUpcoming && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                    </div>
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                      {new Date(coupon.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-1 rounded-full ${isUpcoming ? 'bg-gray-400' : (isExpired ? 'bg-gray-300' : 'bg-black')}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Orders Table - Minimalist Data Grid */}
      <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-black/5 overflow-hidden">
        <div className="p-8 md:p-10 border-b border-black/5 flex justify-between items-center bg-[#FCFCFD]">
          <div>
            <h2 className="text-2xl font-black tracking-tighter text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Live fulfillment feed across all gateways</p>
          </div>
          <a href="/admin/orders" className="px-6 py-3 bg-black text-white rounded-full font-bold text-sm tracking-wide hover:scale-[0.98] transition-transform shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
            View All
          </a>
        </div>
        
        <div className="overflow-x-auto p-4 md:p-6">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="border-b border-black/5 text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                <th className="p-4 pl-6 pb-6">Order Ref</th>
                <th className="p-4 pb-6">Customer</th>
                <th className="p-4 w-1/3 pb-6">Destination</th>
                <th className="p-4 pb-6">Value</th>
                <th className="p-4 pr-6 pb-6 text-right">State</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-gray-500 font-medium">
                    No recent transactions recorded.
                  </td>
                </tr>
              ) : recentOrders.map((order) => {
                const customerName = order.users?.full_name || 'Guest User'
                const customerEmail = order.users?.email || 'N/A'
                const avatarLetter = customerName.charAt(0).toUpperCase()
                
                return (
                  <tr key={order.id} className="group hover:bg-[#F7F7F8] transition-colors rounded-2xl">
                    <td className="p-4 pl-6 align-middle rounded-l-2xl">
                      <p className="font-bold text-gray-900">#{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-black/5 flex items-center justify-center font-black text-xs text-gray-900 shadow-[0_2px_8px_rgba(0,0,0,0.02)] shrink-0">
                          {avatarLetter}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      {order.shipping_address ? (
                        <div className="flex items-center gap-3 w-full min-w-[200px] whitespace-normal">
                          <div className="w-8 h-8 rounded-full bg-white border border-black/5 flex items-center justify-center shrink-0">
                            <MapPin className="w-3 h-3 text-gray-400" strokeWidth={1.5} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm block">{order.shipping_address.name}</span>
                            <span className="text-xs text-gray-500 line-clamp-1">
                              {order.shipping_address.city} • {order.shipping_address.phone}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 font-medium">Digital/No Info</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-black tracking-tight text-gray-900 text-base">
                        ₹{Number(order.total_amount).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="p-4 pr-6 align-middle rounded-r-2xl text-right">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'delivered' ? 'bg-white border border-black/5 text-gray-900' :
                        order.status === 'cancelled' ? 'bg-[#FCFCFD] text-gray-400 line-through border border-transparent' :
                        'bg-black text-white shadow-xs'
                      }`}>
                        {order.status}
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
  )
}
