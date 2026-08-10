const fs = require('fs');

const code = `
'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, Search, Clock, User, Heart, Settings, Bell, Package, CheckCircle, Truck, Info, LogOut, Loader2, ArrowLeft, Star, Edit2, ChevronRight, Droplet, LayoutDashboard, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type TabType = 'dashboard' | 'orders' | 'settings' | 'wishlist' | 'reviews';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'transit' | 'delivered'>('all')

  useEffect(() => {
    setMounted(true)
    if (mounted && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null
    if (tab && ['dashboard', 'orders', 'settings', 'wishlist', 'reviews'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
  }, [user])

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        
        if (data) setOrders(data)
      }
      setLoadingOrders(false)
    }
    
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  if (!mounted || !isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const transitOrders = orders.filter(o => ['pending', 'packed', 'shipped', 'out_for_delivery'].includes(o.status)).length;
  const healthPercent = orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 100;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'transit') return ['pending', 'packed', 'shipped', 'out_for_delivery'].includes(o.status);
    if (orderFilter === 'delivered') return o.status === 'delivered';
    return true;
  });

  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="hidden md:block mb-8">
        <h2 className="text-2xl font-bold text-[#11311F]">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}</h2>
        <p className="text-gray-500 mt-1">Here is a snapshot of your account today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-[#F6F9F7] rounded-3xl p-6 md:p-8 flex flex-col justify-between border border-[#E9F3ED]">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#11311F] text-white flex items-center justify-center text-3xl font-medium">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 hidden md:block">Joined 2024</p>
              <p className="text-sm text-gray-500 mb-1 md:hidden">Hello, Plant Parent!</p>
              <h3 className="text-2xl font-bold text-[#11311F] mb-3">{user?.name || 'User'}</h3>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-3 py-1 bg-white rounded-full text-xs font-bold text-[#11311F] border border-gray-100 flex items-center gap-1 shadow-xs">
                  <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" /> Premium Member
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200/50 justify-center md:justify-start">
            <div className="bg-white rounded-2xl p-4 flex-1 text-center shadow-xs">
              <Package className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-[#11311F]">{orders.length}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-4 flex-1 text-center shadow-xs">
              <ShoppingBag className="w-5 h-5 text-gray-400 mx-auto mb-2" />
              <p className="text-3xl font-black text-[#11311F]">{transitOrders}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">In Transit</p>
            </div>
          </div>
        </div>

        {/* Health / Stats Card */}
        <div className="bg-[#11311F] rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-xl shadow-[#11311F]/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
          <p className="text-[11px] font-bold text-[#A4E4BA] uppercase tracking-wider mb-6">Profile Completion</p>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="#A4E4BA" 
                strokeWidth="8" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * healthPercent) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black">{healthPercent}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-6 max-w-[200px]">Your account setup is almost complete.</p>
        </div>
      </div>

      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-8 mb-4 px-1">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div onClick={() => setActiveTab('orders')} className="bg-[#F8FAF9] rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#E9F3ED] transition-colors border border-gray-100 group">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
            <Package className="w-5 h-5 text-[#11311F]" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#11311F] text-sm mb-0.5">My Orders</h4>
            <p className="text-[11px] text-gray-500">Track and manage past purchases</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

        <div onClick={() => router.push('/shop')} className="bg-[#E9F3ED] rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#D5E8DD] transition-colors border border-transparent group">
          <div className="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
            <Droplet className="w-5 h-5 text-[#11311F]" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#11311F] text-sm mb-0.5">Shop Plants</h4>
            <p className="text-[11px] text-[#235839]">Explore premium new arrivals</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#235839]" />
        </div>

        <div onClick={() => setActiveTab('settings')} className="bg-[#F8FAF9] rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-[#E9F3ED] transition-colors border border-gray-100 group">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0 group-hover:scale-110 transition-transform">
            <Settings className="w-5 h-5 text-[#11311F]" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#11311F] text-sm mb-0.5">Settings</h4>
            <p className="text-[11px] text-gray-500">Account and preferences</p>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>

      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#11311F] tracking-tight">Order History</h2>
          <p className="text-gray-500 mt-1 text-sm">Track your recent botanical additions.</p>
        </div>
        
        <div className="flex bg-gray-100/80 p-1 rounded-full overflow-x-auto no-scrollbar self-start">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'transit', label: 'In Transit' },
            { id: 'delivered', label: 'Delivered' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setOrderFilter(f.id as any)}
              className={\`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap \${
                orderFilter === f.id ? 'bg-[#11311F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
              }\`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loadingOrders ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#11311F]" /></div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-[#F6F9F7] rounded-3xl border border-[#E9F3ED] border-dashed">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-[#11311F] mb-2">No orders found</h3>
          <p className="text-sm text-gray-500 mb-6">You haven't placed any orders matching this filter.</p>
          <button onClick={() => router.push('/shop')} className="px-6 py-2.5 bg-[#11311F] text-white rounded-full text-sm font-bold shadow-md hover:bg-black transition-colors">Start Shopping</button>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-6">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'delivered';
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            
            return (
              <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                
                {/* Header (Mobile Only) */}
                <div className="md:hidden px-5 pt-5 pb-3 flex justify-between items-center border-b border-gray-50">
                  <div className="flex items-center gap-2">
                    {isDelivered ? <CheckCircle className="w-4 h-4 text-[#11311F]" /> : <Truck className="w-4 h-4 text-gray-400" />}
                    <span className={\`text-[11px] font-black uppercase tracking-wider \${isDelivered ? 'text-[#11311F]' : 'text-gray-500'}\`}>
                      {isDelivered ? 'Delivered' : 'In Transit'}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">{dateStr}</span>
                </div>

                <div className="p-5 md:p-6 flex gap-4 md:gap-6 flex-1 items-center">
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-[#F6F9F7] border border-[#E9F3ED] overflow-hidden shrink-0 flex items-center justify-center p-2">
                    {order.order_items?.[0]?.products?.image_url ? (
                      <img src={order.order_items[0].products.image_url} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="hidden md:flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order #{order.id.split('-')[0].toUpperCase()} • {dateStr}</p>
                    </div>
                    
                    <h4 className="font-bold text-[#11311F] text-base md:text-lg mb-1 truncate">
                      {order.order_items?.[0]?.products?.title || 'Premium Plant'}
                    </h4>
                    
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      {order.order_items?.length > 1 ? \`+ \${order.order_items.length - 1} more items\` : 'Single Item'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#11311F] text-lg">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                      
                      <div className="hidden md:block">
                        {isDelivered ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <CheckCircle className="w-4 h-4" /> Delivered on {dateStr}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs font-bold text-[#235839] bg-[#E9F3ED] px-3 py-1.5 rounded-full">
                            <Truck className="w-4 h-4" /> Arriving Soon
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3 md:flex-col md:justify-center md:border-t-0 md:border-l md:w-48">
                  <button className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none md:w-full">
                    View Details
                  </button>
                  <button className="px-4 py-2 bg-[#11311F] text-white rounded-full text-xs font-bold shadow-md hover:bg-black transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-2">
                    {isDelivered ? 'Reorder' : 'Track'} <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                
              </div>
            )
          })}
        </div>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 animate-in fade-in duration-300">
       <h2 className="text-2xl md:text-3xl font-bold text-[#11311F] tracking-tight mb-8">Settings</h2>
       
       <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
         <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
            <input type="email" value={user?.email || ''} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed outline-none" />
         </div>
         
         <div className="pt-6 border-t border-gray-100">
            <button onClick={handleLogout} className="flex items-center justify-center w-full md:w-auto gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-bold transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
         </div>
       </div>
    </div>
  )


  return (
    <div className="min-h-screen bg-[#FCFDFD] md:bg-[#F8FAF9] font-sans text-gray-900 pb-24 md:pb-0 relative flex">
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen shrink-0 z-20">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 mb-2 hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain p-1 border border-gray-100 rounded-full shadow-sm" />
            <h1 className="text-xl font-black text-[#11311F]">Arogyavruksham</h1>
          </Link>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest pl-1">Premium Member</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'orders', label: 'Order History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id as any)}
                className={\`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer \${
                  isActive ? 'bg-[#E9F3ED] text-[#11311F]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }\`}
              >
                <Icon className={\`w-5 h-5 \${isActive ? 'text-[#235839]' : 'text-gray-400'}\`} />
                {item.label}
              </button>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-100">
           <button onClick={handleLogout} className="flex items-center gap-3 text-sm font-bold text-gray-500 hover:text-red-600 transition-colors w-full px-4 py-2">
             <LogOut className="w-4 h-4" /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-5 md:p-12 relative z-10">
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between mb-8 sticky top-0 bg-[#FCFDFD]/90 backdrop-blur-md py-4 z-20 border-b border-gray-50">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-400"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-lg font-black text-[#11311F]">Arogyavruksham</h1>
          <button className="p-2 -mr-2 text-gray-400"><Settings className="w-5 h-5" onClick={() => setActiveTab('settings')} /></button>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Mobile Profile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-100 flex items-center justify-around h-[72px] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'explore', label: 'Explore', icon: Search, onClick: () => router.push('/shop') },
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'settings', label: 'Profile', icon: User }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.id === 'orders') {
            return (
              <button key={item.id} onClick={() => setActiveTab('orders')} className="flex flex-col items-center gap-1.5 p-2 px-4 cursor-pointer relative">
                <div className={\`p-3.5 rounded-full -mt-7 shadow-lg transition-transform \${isActive ? 'bg-[#11311F] text-white scale-110' : 'bg-[#E9F3ED] text-[#235839]'}\`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={\`text-[10px] font-bold \${isActive ? 'text-[#11311F]' : 'text-gray-500'}\`}>{item.label}</span>
              </button>
            )
          }

          return (
            <button key={item.id} onClick={item.onClick || (() => setActiveTab(item.id as any))} className="flex flex-col items-center justify-center gap-1.5 p-2 flex-1 cursor-pointer">
              <Icon className={\`w-5 h-5 transition-colors \${isActive ? 'text-[#11311F]' : 'text-gray-400'}\`} />
              <span className={\`text-[10px] font-bold \${isActive ? 'text-[#11311F]' : 'text-gray-500'}\`}>{item.label}</span>
            </button>
          )
        })}
      </div>
      
    </div>
  )
}
`

fs.writeFileSync('C:\\Users\\saiva\\OneDrive\\Desktop\\WEBSITES\\Arogyavruksham\\src\\app\\profile\\page.tsx', code, 'utf8')
