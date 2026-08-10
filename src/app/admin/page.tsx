'use client'

import { TrendingUp, Users, Package, ShoppingBag, ArrowUpRight, ArrowDownRight, MoreVertical, Loader2, MapPin, Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#111827', '#E2E8F0'];

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
        setRecentOrders(ordersData.slice(0, 6))

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

    const monthlyTarget = 145000;
    const remaining = Math.max(0, monthlyTarget - totalIncome);
    setTargetData([
      { name: 'Achieved', value: totalIncome > 0 ? totalIncome : 1 },
      { name: 'Remaining', value: remaining }
    ]);
  }, [salesMonthFilter, allDailyData])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-16 font-sans text-gray-900">
      
      {/* Header & Global Filter */}
      <div className="flex justify-between items-center border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">
            Comprehensive snapshot of store revenue, customer acquisition, and fulfillment rates.
          </p>
        </div>
        <select 
          value={globalDateFilter}
          onChange={(e) => setGlobalDateFilter(e.target.value)}
          className="bg-white border border-gray-300 text-gray-900 text-sm font-bold rounded-xl px-4 py-2 outline-none shadow-2xs cursor-pointer hover:border-emerald-800 transition-colors"
        >
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="This Month">This Month</option>
          <option value="All Time">All Time</option>
        </select>
      </div>

      {/* Metric Cards - Clean Monochrome Styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="bg-white p-5 rounded-xl shadow-2xs border border-gray-200/80 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-semibold text-sm">Total Revenue ({globalDateFilter})</span>
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 border border-gray-200">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">₹{metrics.totalSales.toLocaleString('en-IN')}</p>
            <span className="inline-flex items-center text-xs font-semibold text-gray-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% from previous term
            </span>
          </div>
        </div>

        {/* Total Order */}
        <div className="bg-white p-5 rounded-xl shadow-2xs border border-gray-200/80 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-semibold text-sm">Total Orders ({globalDateFilter})</span>
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 border border-gray-200">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{metrics.totalOrders}</p>
            <span className="inline-flex items-center text-xs font-semibold text-gray-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +8.4% order velocity
            </span>
          </div>
        </div>

        {/* Total Customer */}
        <div className="bg-white p-5 rounded-xl shadow-2xs border border-gray-200/80 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-semibold text-sm">Unique Customers ({globalDateFilter})</span>
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 border border-gray-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{metrics.totalCustomers}</p>
            <span className="inline-flex items-center text-xs font-semibold text-gray-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> Repeat & new retention
            </span>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="bg-white p-5 rounded-xl shadow-2xs border border-gray-200/80 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-semibold text-sm">Pending Fulfillment</span>
            <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-900 border border-gray-200">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-gray-900">{metrics.pendingDelivery}</p>
            <span className="inline-flex items-center text-xs font-semibold text-gray-500 mt-1">
              Requires immediate action
            </span>
          </div>
        </div>
      </div>
      
      {/* Charts Row - Monochrome Black & White Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Analytic Chart */}
        <div className="bg-white p-6 rounded-xl shadow-2xs border border-gray-200/80 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-900" /> Revenue & Expense Velocity
            </h2>
            <select 
              value={salesMonthFilter}
              onChange={(e) => setSalesMonthFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 font-bold text-xs rounded-xl px-3.5 py-1.5 outline-none cursor-pointer hover:border-gray-400"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-8 mb-6 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 mb-1">Total Income</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-gray-900">₹{chartTotals.income.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded font-bold">+12%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gray-500 mb-1">Est. Expenses</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-gray-900">₹{chartTotals.expenses.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded font-bold">40% Cost</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-black uppercase text-gray-900 mb-1">Net Margin Balance</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-gray-900">₹{chartTotals.balance.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.5 rounded font-bold">Optimal</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#111827" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                <Tooltip cursor={{ stroke: '#cbd5e1', strokeWidth: 1.5, strokeDasharray: '3 3', fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#111827" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  dot={{ r: 3, fill: '#fff', stroke: '#111827', strokeWidth: 2 }} 
                  activeDot={{ r: 5, fill: '#111827', stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Target Donut */}
        <div className="bg-white p-6 rounded-xl shadow-2xs border border-gray-200/80 flex flex-col">
          <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-gray-900" /> Sales Target Quota
          </h2>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
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
            
            <div className="w-full mt-6 space-y-4 bg-gray-50/60 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-xs text-gray-500 font-bold uppercase">Daily Target</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-900 text-sm">
                  ₹5,000
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-800"></div>
                  <span className="text-xs text-gray-900 font-black uppercase">Monthly Goal</span>
                </div>
                <div className="flex items-center gap-1 font-black text-gray-900 text-base">
                  <ArrowUpRight className="w-4 h-4 text-gray-900" /> ₹145,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Offers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-xl shadow-2xs border border-gray-200/80 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-900" /> Top Performing Products
            </h2>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-500">&larr;</button>
              <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-900">&rarr;</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex flex-col border border-gray-200 rounded-xl p-3 hover:border-emerald-800 transition-all group">
                <div className="bg-gray-50 rounded-xl aspect-square mb-3 p-3 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.title} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform" />
                  ) : (
                    <Package className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <h4 className="font-bold text-gray-900 text-xs truncate">{product.title || product.name}</h4>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs font-black text-gray-900">₹{product.price}</span>
                  <span className="text-[10px] bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded font-semibold">{product.sales_count} Sold</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Offer */}
        <div className="bg-white p-6 rounded-xl shadow-2xs border border-gray-200/80">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-gray-900" /> Active Campaigns
            </h2>
            <a href="/admin/offers" className="text-xs font-bold text-gray-900 underline hover:no-underline">Manage</a>
          </div>
          <div className="space-y-6">
            {activeCoupons.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No active offers available.</p>
            ) : activeCoupons.map(coupon => {
              const start = new Date(coupon.start_date).getTime();
              const end = new Date(coupon.expiry_date).getTime();
              const now = Date.now();
              const totalDuration = end - start;
              const elapsed = now - start;
              let progress = 0;
              
              if (now < start) {
                progress = 0;
              } else if (now > end) {
                progress = 100;
              } else {
                progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
              }

              const isUpcoming = now < start;
              const isExpired = now > end;

              return (
                <div key={coupon.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex justify-between items-center text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{coupon.title}</span>
                      {isExpired && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-200 text-gray-600 uppercase">Expired</span>}
                      {isUpcoming && <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-gray-200 text-gray-800 uppercase">Scheduled</span>}
                      {!isExpired && !isUpcoming && <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-800 text-white uppercase">Active</span>}
                    </div>
                    <span className="text-gray-500 text-[11px] font-medium">
                      {new Date(coupon.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full ${isUpcoming ? 'bg-gray-400' : (isExpired ? 'bg-gray-300' : 'bg-emerald-800')}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Orders Table - Clean Card System */}
      <div className="bg-white rounded-xl shadow-2xs border border-gray-200/80 overflow-hidden mt-6">
        <div className="p-6 border-b border-gray-200/80 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-black text-lg text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-900" /> Recent Orders Details
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Live transaction records across all payment gateways</p>
          </div>
          <a href="/admin/orders" className="text-xs font-bold bg-emerald-800 text-white hover:bg-emerald-900 px-4 py-2 rounded-xl transition-all shadow-xs">
            View All Orders
          </a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 pl-6">Order Info</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4 w-1/3">Shipping Address</th>
                <th className="p-4">Amount</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 italic">
                    No recent orders recorded yet.
                  </td>
                </tr>
              ) : recentOrders.map((order) => {
                const customerName = order.users?.full_name || 'Guest Customer'
                const customerEmail = order.users?.email || 'N/A'
                const avatarLetter = customerName.charAt(0).toUpperCase()
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6 align-top">
                      <p className="font-bold font-mono text-gray-900">#{order.id.split('-')[0].toUpperCase()}</p>
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 flex items-center justify-center font-black text-xs shrink-0">{avatarLetter}</div>
                        <div>
                          <p className="font-bold text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {order.shipping_address ? (
                        <div className="text-xs text-gray-600 bg-gray-50/80 p-3 rounded-xl border border-gray-100 w-full min-w-[200px] whitespace-normal">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-700" />
                            <span className="font-bold text-gray-900">{order.shipping_address.name}</span>
                          </div>
                          <p className="leading-relaxed text-gray-600 line-clamp-2">
                            {order.shipping_address.fullAddress}, {order.shipping_address.city}
                          </p>
                          <p className="mt-1 font-mono font-bold text-gray-500">{order.shipping_address.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">No shipping info</span>
                      )}
                    </td>
                    <td className="p-4 align-top font-black text-gray-900 text-base">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 pr-6 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
                        order.status === 'delivered' ? 'bg-gray-100 text-gray-900 border border-gray-300' :
                        order.status === 'cancelled' ? 'bg-gray-100 text-gray-400 border border-gray-200 line-through' :
                        'bg-emerald-800 text-white'
                      }`}>
                        {order.status.toUpperCase()}
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
