
'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { Home, Search, Clock, User, Heart, Settings, Bell, Package, CheckCircle, Truck, Info, LogOut, Loader2, ArrowLeft, Star, Edit2, ChevronRight, Droplet, LayoutDashboard, ShoppingBag, X, MapPin, RotateCcw, Eye, Ban } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type TabType = 'dashboard' | 'orders' | 'settings' | 'wishlist' | 'reviews';

export default function ProfilePage() {
  const { user, isAuthenticated, logout, login } = useAuthStore()
  const { addItem } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'transit' | 'delivered'>('all')
  const [cancelModal, setCancelModal] = useState<{ open: boolean; orderId: string; loading: boolean }>({ open: false, orderId: '', loading: false })
  const [trackModal, setTrackModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null })
  const [viewModal, setViewModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null })
  const [successToast, setSuccessToast] = useState('')

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

  const handleCancelOrder = async () => {
    setCancelModal(m => ({ ...m, loading: true }));
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', cancelModal.orderId);
    if (!error) {
      setOrders(orders.map(o => o.id === cancelModal.orderId ? { ...o, status: 'cancelled' } : o));
      setCancelModal({ open: false, orderId: '', loading: false });
      setSuccessToast('Order cancelled successfully');
      setTimeout(() => setSuccessToast(''), 3000);
    } else {
      setCancelModal(m => ({ ...m, loading: false }));
    }
  };

  const handleReorder = (order: any) => {
    if (order.order_items) {
      order.order_items.forEach((item: any) => {
        if (item.products) {
          addItem({
            id: item.products.id,
            title: item.products.title,
            price: item.products.price || item.price,
            imageUrl: item.products.image_url,
            quantity: item.quantity,
          });
        }
      });
      router.push('/checkout');
    }
  };

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
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                orderFilter === f.id ? 'bg-[#11311F] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
              }`}
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
                    {isDelivered ? <CheckCircle className="w-4 h-4 text-[#11311F]" /> : order.status === 'cancelled' ? <Info className="w-4 h-4 text-red-500" /> : <Truck className="w-4 h-4 text-gray-400" />}
                    <span className={`text-[11px] font-black uppercase tracking-wider ${isDelivered ? 'text-[#11311F]' : order.status === 'cancelled' ? 'text-red-500' : 'text-gray-500'}`}>
                      {isDelivered ? 'Delivered' : order.status === 'cancelled' ? 'Cancelled' : 'In Transit'}
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
                      {order.order_items?.length > 1 ? `+ ${order.order_items.length - 1} more items` : 'Single Item'}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#11311F] text-lg">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                      
                      <div className="hidden md:block">
                        {isDelivered ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                            <CheckCircle className="w-4 h-4" /> Delivered on {dateStr}
                          </div>
                        ) : order.status === 'cancelled' ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                            <Info className="w-4 h-4" /> Cancelled
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

                <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 md:flex-col md:justify-center md:border-t-0 md:border-l md:w-48">
                  <button onClick={() => setViewModal({ open: true, order })} className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View More
                  </button>
                  {order.status !== 'cancelled' && !isDelivered && (
                    <button onClick={() => setCancelModal({ open: true, orderId: order.id, loading: false })} className="px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs font-bold hover:bg-red-50 transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5">
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                  {order.status !== 'cancelled' && (
                    <button onClick={() => isDelivered ? handleReorder(order) : setTrackModal({ open: true, order })} className="px-4 py-2 bg-[#11311F] text-white rounded-full text-xs font-bold shadow-md hover:bg-black transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5">
                      {isDelivered ? <><RotateCcw className="w-3.5 h-3.5" /> Order Again</> : <><MapPin className="w-3.5 h-3.5" /> Track Order</>}
                    </button>
                  )}
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
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
              <input type="email" value={user?.email || 'Not provided'} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed outline-none" />
           </div>
           <div>
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number</label>
              <input type="tel" value={user?.phone || 'Not provided'} disabled className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-medium cursor-not-allowed outline-none" />
           </div>
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
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, onClick: () => router.push('/') },
            ...(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor' ? [{ id: 'admin', label: 'Admin Panel', icon: Settings, onClick: () => router.push('/admin') }] : []),
            { id: 'orders', label: 'Order History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id} 
                onClick={item.onClick || (() => setActiveTab(item.id as any))}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${
                  isActive ? 'bg-[#E9F3ED] text-[#11311F]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#235839]' : 'text-gray-400'}`} />
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
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
            <h1 className="text-lg font-black text-[#11311F]">Arogyavruksham</h1>
          </div>
          <button className="p-2 -mr-2 text-gray-400"><Settings className="w-5 h-5" onClick={() => setActiveTab('settings')} /></button>
        </div>

        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Mobile Profile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-100 flex items-center justify-around h-[72px] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => router.push('/') },
          ...(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor' ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard, onClick: () => router.push('/admin') }] : []),
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'shop', label: 'Shop', icon: Search, onClick: () => router.push('/shop') }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          if (item.id === 'orders') {
            return (
              <button key={item.id} onClick={() => setActiveTab('orders')} className="flex flex-col items-center gap-1.5 p-2 px-4 cursor-pointer relative">
                <div className={`p-3 rounded-full transition-colors ${isActive ? 'bg-[#E9F3ED] text-[#11311F]' : 'bg-transparent text-gray-400'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-bold ${isActive ? 'text-[#11311F]' : 'text-gray-500'}`}>{item.label}</span>
              </button>
            )
          }

          return (
            <button key={item.id} onClick={item.onClick || (() => setActiveTab(item.id as any))} className="flex flex-col items-center justify-center gap-1.5 p-2 flex-1 cursor-pointer">
              <Icon className={`w-6 h-6 transition-colors ${isActive ? 'text-[#11311F]' : 'text-gray-400'}`} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#11311F]' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* ═══ SUCCESS TOAST ═══ */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#11311F] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold">
            <CheckCircle className="w-4 h-4 text-[#A4E4BA]" /> {successToast}
          </div>
        </div>
      )}

      {/* ═══ CANCEL ORDER MODAL ═══ */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !cancelModal.loading && setCancelModal({ open: false, orderId: '', loading: false })}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <Ban className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#11311F] mb-2">Cancel Order?</h3>
            <p className="text-gray-500 text-sm mb-8">This action cannot be undone. Your order will be cancelled and any payment will be refunded.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, orderId: '', loading: false })}
                disabled={cancelModal.loading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelModal.loading}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                {cancelModal.loading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRACK ORDER MODAL ═══ */}
      {trackModal.open && trackModal.order && (() => {
        const o = trackModal.order;
        const steps = [
          { key: 'pending', label: 'Order Placed', desc: 'Your order has been confirmed' },
          { key: 'packed', label: 'Packed', desc: 'Items are being packed' },
          { key: 'shipped', label: 'Shipped', desc: 'On the way to your city' },
          { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Will arrive today' },
          { key: 'delivered', label: 'Delivered', desc: 'Successfully delivered' },
        ];
        const currentIdx = steps.findIndex(s => s.key === o.status);
        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setTrackModal({ open: false, order: null })}>
            <div className="bg-white rounded-t-3xl md:rounded-3xl p-8 w-full md:max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#11311F]">Track Order</h3>
                <button onClick={() => setTrackModal({ open: false, order: null })} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-[#F6F9F7] rounded-2xl p-5 mb-8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#E9F3ED] overflow-hidden flex items-center justify-center p-2 shrink-0">
                  {o.order_items?.[0]?.products?.image_url ? (
                    <img src={o.order_items[0].products.image_url} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : <Package className="w-6 h-6 text-gray-300" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-[#11311F] text-sm truncate">{o.order_items?.[0]?.products?.title || 'Order'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Order #{o.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-sm font-bold text-[#11311F] mt-1">₹{o.total_amount?.toLocaleString('en-IN')}</p>
                </div>
              </div>
              {/* Steps */}
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const done = i <= currentIdx;
                  const isCurrent = i === currentIdx;
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${done ? 'bg-[#11311F] text-white' : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-4 ring-[#E9F3ED]' : ''}`}>
                          {done ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>
                        {i < steps.length - 1 && <div className={`w-0.5 h-10 ${done ? 'bg-[#11311F]' : 'bg-gray-200'}`} />}
                      </div>
                      <div className={`pb-8 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                        <p className={`font-bold text-sm ${done ? 'text-[#11311F]' : 'text-gray-400'}`}>{step.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ VIEW MORE MODAL ═══ */}
      {viewModal.open && viewModal.order && (() => {
        const o = viewModal.order;
        const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewModal({ open: false, order: null })}>
            <div className="bg-white rounded-t-3xl md:rounded-3xl p-8 w-full md:max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#11311F]">Order Details</h3>
                <button onClick={() => setViewModal({ open: false, order: null })} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="font-bold text-[#11311F] text-sm mt-0.5">#{o.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placed On</p>
                  <p className="font-bold text-[#11311F] text-sm mt-0.5">{dateStr}</p>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {o.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 rounded-xl bg-[#F6F9F7] border border-[#E9F3ED] overflow-hidden flex items-center justify-center p-2 shrink-0">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : <Package className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#11311F] text-sm truncate">{item.products?.title || 'Item'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-[#11311F] text-sm shrink-0">₹{((item.price_at_time || 0) * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              <div className="bg-[#F6F9F7] rounded-2xl p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold capitalize ${o.status === 'delivered' ? 'text-[#11311F]' : o.status === 'cancelled' ? 'text-red-500' : 'text-amber-600'}`}>{o.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-gray-200/50 pt-3">
                  <span className="font-bold text-[#11311F]">Total</span>
                  <span className="font-black text-[#11311F] text-lg">₹{o.total_amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
      
    </div>
  )
}
