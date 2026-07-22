'use client'

import { TrendingUp, Users, Package, ShoppingBag, ArrowUpRight, ArrowDownRight, MoreVertical, Loader2, MapPin } from 'lucide-react'
import { useEffect, useState } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const PIE_COLORS = ['#51D3B7', '#E2E8F0'];

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
      // Fetch Orders
      const { data: ordersData } = await adminDbProxy({
        action: 'select',
        table: 'orders',
        select: 'id, total_amount, status, created_at, user_id, shipping_address, users (full_name, email)',
        order: { column: 'created_at', ascending: false }
      })

      // Fetch Order Items for Top Products
      const { data: orderItemsData } = await adminDbProxy({
        action: 'select',
        table: 'order_items',
        select: 'product_id, quantity'
      })

      if (ordersData) {
        const validOrders = ordersData.filter((o: any) => o.status !== 'cancelled')
        setAllValidOrders(validOrders)
        setRecentOrders(ordersData.slice(0, 5))

        // Fetch Daily Analytics
        const { data: dailyData } = await adminDbProxy({
          action: 'select',
          table: 'daily_analytics',
          order: { column: 'date', ascending: true }
        })
          
        let finalDailyData: any[] = []
        if (dailyData && dailyData.length > 0) {
          finalDailyData = dailyData
        } else {
          // Fallback to calculating from orders if table is empty or missing
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

        // Populate available months for the Sales Analytic dropdown
        const monthsSet = new Set<string>()
        finalDailyData.forEach(d => {
          const monthStr = new Date(d.date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
          monthsSet.add(monthStr)
        })
        const monthsArray = Array.from(monthsSet).reverse() // Latest first
        setAvailableMonths(monthsArray.length > 0 ? monthsArray : ['Jul 2023'])
        if (!salesMonthFilter) setSalesMonthFilter(monthsArray[0] || 'Jul 2023')
      }

      // Calculate Top Selling Products
      if (orderItemsData && orderItemsData.length > 0) {
        const productSalesCount: Record<string, number> = {};
        orderItemsData.forEach((item: any) => {
          productSalesCount[item.product_id] = (productSalesCount[item.product_id] || 0) + item.quantity;
        });
        
        const topProductIds = Object.keys(productSalesCount)
          .sort((a,b) => productSalesCount[b] - productSalesCount[a])
          .slice(0, 4);

        if (topProductIds.length > 0) {
          // Since the proxy doesn't support 'in' operator natively, we fetch all and filter
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
        // Fallback if no order items exist
        const { data: productsData } = await adminDbProxy({
          action: 'select',
          table: 'products'
        })
        if (productsData) setTopProducts(productsData.slice(0, 4).map((p: any) => ({...p, sales_count: 0})));
      }

      // Fetch Active Coupons
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
  }, []) // Empty dependency array for initial fetch

  // Calculate top metrics based on global date filter
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

  // Calculate Sales Analytic chart data based on selected month
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

    // Update Sales Target Data (Assuming monthly target is 145,000)
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
        <Loader2 className="w-8 h-8 animate-spin text-[#51D3B7]" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden pb-24 md:pb-8">
      
      {/* Mobile Global Date Filter */}
      <div className="flex justify-end lg:hidden mb-4">
        <select 
          value={globalDateFilter}
          onChange={(e) => setGlobalDateFilter(e.target.value)}
          className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-4 py-2 outline-none shadow-sm cursor-pointer hover:border-gray-300 w-full sm:w-auto"
        >
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="This Month">This Month</option>
          <option value="All Time">All Time</option>
        </select>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        <div className="absolute -top-16 right-0 z-10 flex gap-4 hidden lg:flex">
          <select 
            value={globalDateFilter}
            onChange={(e) => setGlobalDateFilter(e.target.value)}
            className="bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg px-4 py-2 outline-none shadow-sm cursor-pointer hover:border-gray-300"
          >
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Month">This Month</option>
            <option value="All Time">All Time</option>
          </select>
        </div>
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium text-sm">Total Revenue<br/><span className="text-xs text-gray-400">{globalDateFilter}</span></h3>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-[#51D3B7]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-gray-900">₹{metrics.totalSales.toLocaleString('en-IN')}</p>
            <span className="flex items-center text-xs font-bold text-[#51D3B7]">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 11%
            </span>
          </div>
        </div>

        {/* Total Order */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium text-sm">Total Order<br/><span className="text-xs text-gray-400">{globalDateFilter}</span></h3>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-gray-900">{metrics.totalOrders}</p>
            <span className="flex items-center text-xs font-bold text-[#51D3B7]">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 11%
            </span>
          </div>
        </div>

        {/* Total Customer */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium text-sm">Total Customer<br/><span className="text-xs text-gray-400">{globalDateFilter}</span></h3>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-gray-900">{metrics.totalCustomers}</p>
            <span className="flex items-center text-xs font-bold text-red-500">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> 17%
            </span>
          </div>
        </div>

        {/* Pending Delivery */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-500 font-medium text-sm">Pending Delivery<br/><span className="text-xs text-gray-400">{globalDateFilter}</span></h3>
            <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center text-orange-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-bold text-gray-900">{metrics.pendingDelivery}</p>
            <span className="flex items-center text-xs font-bold text-[#51D3B7]">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> 5%
            </span>
          </div>
        </div>
      </div>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Analytic Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Sales Analytic</h2>
            <select 
              value={salesMonthFilter}
              onChange={(e) => setSalesMonthFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg px-3 py-1.5 outline-none cursor-pointer"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-4 sm:gap-8 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Income</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">{chartTotals.income.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold mb-1">+0.05%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Expenses</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">{chartTotals.expenses.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded font-bold mb-1">+0.05%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Balance</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-gray-900">{chartTotals.balance.toLocaleString('en-IN')}</p>
                <span className="text-[10px] bg-green-50 text-[#51D3B7] px-1.5 py-0.5 rounded font-bold mb-1">+0.05%</span>
              </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#51D3B7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#51D3B7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip cursor={{ stroke: '#f1f5f9', strokeWidth: 2, strokeDasharray: '3 3', fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#51D3B7" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorIncome)" 
                  dot={{ r: 4, fill: '#fff', stroke: '#51D3B7', strokeWidth: 2 }} 
                  activeDot={{ r: 6, fill: '#51D3B7', stroke: '#fff', strokeWidth: 2 }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales Target Donut */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Sales Target</h2>
          <div className="flex-1 flex flex-col justify-center items-center relative">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={targetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
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
            
            <div className="w-full mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm text-gray-500 font-medium">Daily Target</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <ArrowDownRight className="w-3 h-3 text-red-500" /> 650
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#51D3B7]"></div>
                  <span className="text-sm text-gray-500 font-medium">Monthly Target</span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                  <ArrowUpRight className="w-3 h-3 text-[#51D3B7]" /> 145,000
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Offers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-gray-100 rounded text-gray-400">&larr;</button>
              <button className="p-1 hover:bg-gray-100 rounded text-gray-600">&rarr;</button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {topProducts.map((product) => (
              <div key={product.id} className="flex flex-col">
                <div className="bg-gray-100 rounded-xl aspect-square mb-3 p-4 flex items-center justify-center">
                  <img src={product.image_url} alt={product.name} className="object-contain w-full h-full mix-blend-multiply" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate">{product.title || product.name}</h4>
                <p className="text-xs text-gray-500 mt-1">₹{product.price} • {product.sales_count} Pcs</p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Offer */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Current Offers</h2>
            <a href="/admin/offers" className="text-xs font-bold text-[#51D3B7] hover:underline">Manage</a>
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
                progress = 0; // Upcoming
              } else if (now > end) {
                progress = 100; // Expired
              } else {
                progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
              }

              const isUpcoming = now < start;
              const isExpired = now > end;

              return (
                <div key={coupon.id}>
                  <div className="flex justify-between items-center text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{coupon.title}</span>
                      {isExpired && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-100">Expired</span>}
                      {isUpcoming && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100">Scheduled</span>}
                      {!isExpired && !isUpcoming && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-100">Active</span>}
                    </div>
                    <span className="text-gray-400 text-xs">
                      {isUpcoming ? 'Starts on: ' : (isExpired ? 'Expired on: ' : 'Expires on: ')} 
                      {new Date(coupon.expiry_date).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isUpcoming ? 'bg-orange-400' : (isExpired ? 'bg-red-400' : 'bg-[#51D3B7]')}`} 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed Orders & Shipping Address Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h2 className="font-bold text-lg text-gray-900">Recent Orders Details</h2>
          <button className="text-sm text-[#51D3B7] font-bold hover:underline">View All</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 rounded-tl-xl">Order Info</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4 w-1/3">Shipping Address</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No recent orders.
                  </td>
                </tr>
              ) : recentOrders.map((order) => {
                const customerName = order.users?.full_name || 'Unknown Customer'
                const customerEmail = order.users?.email || 'N/A'
                const avatarLetter = customerName.charAt(0).toUpperCase()
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <p className="font-bold text-gray-900">#{order.id.split('-')[0]}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#51D3B7]/10 text-[#51D3B7] flex items-center justify-center font-bold text-xs shrink-0">{avatarLetter}</div>
                        <div>
                          <p className="font-bold text-gray-900">{customerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{customerEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      {order.shipping_address ? (
                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 w-full min-w-[200px] whitespace-normal">
                          <div className="flex items-center gap-2 mb-1.5">
                            <MapPin className="w-3.5 h-3.5 text-[#51D3B7]" />
                            <span className="font-bold text-gray-900">{order.shipping_address.name}</span>
                          </div>
                          <p className="leading-relaxed line-clamp-2" title={`${order.shipping_address.fullAddress}, ${order.shipping_address.city}, ${order.shipping_address.state} - ${order.shipping_address.pincode}`}>
                            {order.shipping_address.fullAddress}, {order.shipping_address.city}
                          </p>
                          <p className="mt-1 font-medium text-gray-500">{order.shipping_address.phone}</p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 inline-block">No shipping info</span>
                      )}
                    </td>
                    <td className="p-4 align-top font-bold text-gray-900">
                      ₹{Number(order.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 align-top">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide ${
                        order.status === 'delivered' ? 'bg-[#51D3B7]/10 text-[#21a588]' :
                        order.status === 'cancelled' ? 'bg-red-50 text-red-600' :
                        order.status === 'shipped' ? 'bg-blue-50 text-blue-600' :
                        'bg-orange-50 text-orange-500'
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
