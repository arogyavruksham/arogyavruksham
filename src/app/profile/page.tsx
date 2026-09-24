
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
      <div className="hidden md:flex justify-between items-end mb-10 pb-6 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-[#235839] uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#A4E4BA]"></span> Overview
          </p>
          <h2 className="text-4xl font-black text-[#11311F] tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Guest'}.</h2>
          <p className="text-gray-500 mt-2 text-lg">Here is a snapshot of your botanical journey today.</p>
        </div>
        <button onClick={() => router.push('/shop')} className="px-6 py-3 bg-[#11311F] text-white rounded-full text-sm font-bold shadow-lg shadow-[#11311F]/20 hover:bg-black hover:scale-105 transition-all duration-300">
          Shop New Arrivals
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-[#F6F9F7] to-white rounded-3xl p-6 md:p-10 flex flex-col justify-between border border-[#E9F3ED] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#E9F3ED]/60 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 text-center md:text-left z-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 md:border-8 border-white shadow-lg shrink-0 relative">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#11311F] to-[#235839] text-white flex items-center justify-center text-4xl md:text-5xl font-black">
                  {initials}
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-full"></div>
            </div>
            <div className="pt-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 hidden md:block">Member since 2024</p>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 md:hidden">Hello, Plant Parent!</p>
              <h3 className="text-3xl md:text-4xl font-black text-[#11311F] mb-4 tracking-tight">{user?.name || 'User'}</h3>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="px-4 py-2 bg-white rounded-full text-xs font-bold text-[#11311F] border border-gray-100 flex items-center gap-1.5 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-[#FFB800] fill-[#FFB800]" /> Premium Member
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4 md:gap-6 mt-8 md:mt-10 pt-6 md:pt-8 border-t border-gray-100 justify-center md:justify-start z-10">
            <div className="bg-white rounded-2xl p-5 md:p-6 flex-1 text-center shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
              <Package className="w-6 h-6 text-[#A4E4BA] mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-black text-[#11311F]">{orders.length}</p>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">Total Orders</p>
            </div>
            <div className="bg-white rounded-2xl p-5 md:p-6 flex-1 text-center shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
              <ShoppingBag className="w-6 h-6 text-[#A4E4BA] mx-auto mb-3" />
              <p className="text-3xl md:text-4xl font-black text-[#11311F]">{transitOrders}</p>
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">In Transit</p>
            </div>
          </div>
        </div>

        {/* Health / Stats Card */}
        <div className="bg-gradient-to-br from-[#11311F] to-[#0A1F13] rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden shadow-xl shadow-[#11311F]/20 group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#A4E4BA] opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#235839] opacity-20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>
          <p className="text-xs md:text-sm font-bold text-[#A4E4BA] uppercase tracking-widest mb-6 md:mb-8 relative z-10">Profile Strength</p>
          <div className="relative w-36 h-36 md:w-44 md:h-44 flex items-center justify-center z-10">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-lg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle 
                cx="50" 
                cy="50" 
                r="45" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="6" 
                strokeDasharray="283" 
                strokeDashoffset={283 - (283 * healthPercent) / 100} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A4E4BA" />
                  <stop offset="100%" stopColor="#E9F3ED" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-black tracking-tighter">{healthPercent}%</span>
            </div>
          </div>
          <p className="text-sm text-gray-300 mt-8 md:mt-10 max-w-[200px] leading-relaxed relative z-10 font-medium">Your botanical sanctuary is almost ready.</p>
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-10 md:mt-12 mb-6 px-1">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        
        <div onClick={() => setActiveTab('orders')} className="bg-white rounded-3xl p-6 md:p-8 flex items-center gap-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F9F7] border border-[#E9F3ED] flex items-center justify-center shadow-inner shrink-0 group-hover:bg-[#11311F] transition-colors duration-300">
            <Package className="w-6 h-6 text-[#11311F] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#11311F] text-base mb-1">My Orders</h4>
            <p className="text-xs text-gray-500 font-medium">Track your purchases</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E9F3ED] transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#11311F] transition-colors" />
          </div>
        </div>

        <div onClick={() => router.push('/shop')} className="bg-gradient-to-br from-[#E9F3ED] to-[#D5E8DD] rounded-3xl p-6 md:p-8 flex items-center gap-5 cursor-pointer hover:shadow-xl hover:shadow-[#235839]/10 transition-all duration-300 hover:-translate-y-1 border border-[#A4E4BA]/50 group relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
          <div className="w-14 h-14 rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 flex items-center justify-center shadow-sm shrink-0 group-hover:bg-white transition-colors duration-300 relative z-10">
            <Droplet className="w-6 h-6 text-[#235839]" />
          </div>
          <div className="flex-1 relative z-10">
            <h4 className="font-bold text-[#11311F] text-base mb-1">Shop Plants</h4>
            <p className="text-xs text-[#235839] font-medium">Explore premium arrivals</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center group-hover:bg-white transition-colors relative z-10">
            <ChevronRight className="w-4 h-4 text-[#235839]" />
          </div>
        </div>

        <div onClick={() => setActiveTab('settings')} className="bg-white rounded-3xl p-6 md:p-8 flex items-center gap-5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 group shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#F6F9F7] border border-[#E9F3ED] flex items-center justify-center shadow-inner shrink-0 group-hover:bg-[#11311F] transition-colors duration-300">
            <Settings className="w-6 h-6 text-[#11311F] group-hover:text-white transition-colors duration-300" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-[#11311F] text-base mb-1">Settings</h4>
            <p className="text-xs text-gray-500 font-medium">Account preferences</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#E9F3ED] transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#11311F] transition-colors" />
          </div>
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
      <aside className="w-72 bg-[#FCFDFD] border-r border-gray-100 hidden md:flex flex-col sticky top-0 h-screen shrink-0 z-20 shadow-[4px_0_24px_rgba(17,49,31,0.02)]">
        <div className="p-8 pb-4">
          <Link href="/" className="flex flex-col gap-2 mb-4 hover:opacity-80 transition-opacity group">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
              <img src="/text_logo.png" alt="Arogyavruksham" className="h-8 object-contain" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E9F3ED]/50 rounded-full border border-[#A4E4BA]/30">
            <Star className="w-3 h-3 text-[#FFB800] fill-[#FFB800]" />
            <span className="text-[10px] text-[#11311F] font-bold uppercase tracking-widest">Premium Member</span>
          </div>
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
                className={`w-full flex items-center gap-3.5 px-5 py-4 rounded-2xl font-bold text-sm transition-all duration-300 cursor-pointer relative overflow-hidden group ${
                  isActive ? 'bg-[#11311F] text-white shadow-md shadow-[#11311F]/10' : 'text-gray-500 hover:bg-[#E9F3ED]/50 hover:text-[#11311F]'
                }`}
              >
                {isActive && <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50" />}
                <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-[#A4E4BA]' : 'text-gray-400 group-hover:text-[#235839]'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/30">
           <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full px-4 py-3 rounded-xl border border-transparent hover:border-red-100 group">
             <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-5 md:p-12 relative z-10">
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
