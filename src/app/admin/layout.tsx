'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Package, Settings, LogOut, ShoppingCart, Users, ShieldCheck, Menu, X, BarChart2, Tag, Archive, Mail, Bell, Search, ChevronRight, Loader2, ShoppingBag, Megaphone, Lock, LayoutGrid, User, Sparkles, Bot } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AdminLockScreen } from '@/components/admin/AdminLockScreen'
import { ADMIN_NAV_GROUPS, filterNavForRole, isNavActive, type AdminNavItem } from '@/lib/admin-nav'
import { useEffect, useState, useRef, type ComponentType } from 'react'
import { supabase } from '@/lib/supabase'

const NAV_ICONS: Record<string, ComponentType<{ className?: string, strokeWidth?: number }>> = {
  Sparkles, BarChart2, Bot, Package, Archive, ShoppingCart, LayoutGrid, Tag, Megaphone, Mail, Users, Settings,
}

// Light stroke variants for the custom SVG icons
const PottedPlantIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v5a5 5 0 0 0 10 0v-5" />
    <path d="M5 7h14l-1 4H6Z" />
    <path d="M12 7V3" />
    <path d="M8 5c1 0 2-1 2-2" />
    <path d="M16 5c-1 0-2-1-2-2" />
  </svg>
)

const DashboardGridIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdminUnlocked, setAdminUnlocked } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ products: any[], orders: any[] }>({ products: [], orders: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showApps, setShowApps] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const appsRef = useRef<HTMLDivElement>(null)
  const navItems = filterNavForRole(user?.role)

  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  const showGlobalToast = (message: string) => {
    setToast({ message, visible: true })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 4000)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setShowApps(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  useEffect(() => {
    if (!isAdminUnlocked) return;

    async function loadNotifications() {
      const { data } = await supabase
        .from('orders')
        .select('id, total_amount, status, created_at, shipping_address, users(full_name)')
        .order('created_at', { ascending: false })
        .limit(12);
      if (data) {
        setNotifications(data);
        const count = data.filter(o => o.status === 'pending').length;
        setUnreadCount(count);
      }
    }
    loadNotifications();

    const channel = supabase.channel(`admin_header_global_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        loadNotifications();
        if (payload.eventType === 'INSERT') {
          const amount = payload.new.total_amount || 0;
          let name = 'Customer';
          if (payload.new.shipping_address) {
            try {
              const addr = typeof payload.new.shipping_address === 'string' 
                ? JSON.parse(payload.new.shipping_address) 
                : payload.new.shipping_address;
              name = addr.fullName || addr.full_name || 'Customer';
            } catch (e) {}
          }
          showGlobalToast(`🎉 Order received from ${name} for ₹${amount}!`);
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'newsletter_subscribers' }, () => {
        showGlobalToast('📧 New newsletter subscriber!');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminUnlocked])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ products: [], orders: [] })
      setShowDropdown(false)
      return
    }
    
    setShowDropdown(true)
    const timer = setTimeout(async () => {
      setIsSearching(true)
      
      const [productsRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id, title, image_url, price').ilike('title', `%${searchQuery}%`).limit(3),
        supabase.from('orders').select('id, status, total_amount, users(full_name)').ilike('id', `%${searchQuery}%`).limit(3)
      ])
      
      setSearchResults({
        products: productsRes.data || [],
        orders: ordersRes.data || []
      })
      setIsSearching(false)
    }, 400)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setMounted(true)
    if (mounted && !user) {
      router.push('/')
    }

    if (mounted && user) {
      if (user.role === 'editor' && pathname !== '/admin/products' && pathname !== '/admin/inventory') {
        router.push('/admin/products')
      } else if (user.role === 'manager' && pathname === '/admin/analytics') {
        router.push('/admin')
      }
    }
  }, [mounted, user, pathname, router])

  if (!mounted) return null

  if (user && user.role !== 'admin' && user.role !== 'manager' && user.role !== 'editor') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F3F4F6] flex-col gap-6 font-sans">
        <div className="p-4 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E5E7EB]">
          <ShieldCheck className="w-12 h-12 text-[#9CA3AF]" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tighter text-[#111827] mb-2">Access Denied</h1>
          <p className="text-[#6B7280] mb-6 font-medium">Administrator privileges required.</p>
          <Link href="/" className="px-4 py-2 bg-[#059669] text-white shadow-sm border-0 rounded-full font-bold text-sm tracking-wide hover:scale-[0.98] transition-transform">
            Return Home
          </Link>
        </div>
      </div>
    )
  }

  if (!isAdminUnlocked) {
    return (
      <div className="flex flex-col min-h-[100dvh] font-sans bg-[#F3F4F6]">
        <AdminLockScreen />
      </div>
    )
  }

  const handleAdminLogout = () => {
    setAdminUnlocked(false)
    router.push('/profile')
  }

  return (
    <div className="flex flex-col fixed inset-0 md:relative md:h-[100dvh] bg-[#F3F4F6] font-sans text-[#111827] overflow-hidden md:p-3 transition-colors duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
      <style dangerouslySetInnerHTML={{ __html: `html { zoom: 1 !important; }` }} />
      
      {/* Outer Shell -> Inner Core (Double-Bezel Architecture) */}
      <div className="flex flex-col md:flex-row flex-1 bg-white md:rounded-2xl md:shadow-[0_8px_40px_rgba(0,0,0,0.03)] md:border md:border-[#E5E7EB] overflow-hidden relative">

        {/* Mobile Bottom Nav - Floating Pill Style */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-xl border border-[#E5E7EB] rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-2">
            <div className="flex items-center justify-between">
              {[
                { name: 'Dash', path: '/admin', icon: DashboardGridIcon, active: pathname === '/admin' },
                { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, active: pathname?.startsWith('/admin/orders') },
                { name: 'Stock', path: '/admin/inventory', icon: PottedPlantIcon, active: pathname?.startsWith('/admin/inventory') },
                { name: 'Lock', onClick: handleAdminLogout, icon: Lock, active: false },
              ].map((tab) => {
                const Icon = tab.icon;
                const content = (
                  <>
                    <Icon className={`w-5 h-5 mb-1 ${tab.active ? 'text-[#059669]' : 'text-[#9CA3AF]'}`} strokeWidth={1.5} />
                    <span className={`text-[10px] tracking-wide ${tab.active ? 'font-bold text-[#059669]' : 'font-medium text-[#9CA3AF]'}`}>
                      {tab.name}
                    </span>
                  </>
                );

                if (tab.onClick) {
                  return (
                    <button
                      key={tab.name}
                      onClick={tab.onClick}
                      className="flex flex-col items-center justify-center flex-1 py-2 rounded-full hover:bg-[#F3F4F6] transition-colors"
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link 
                    key={tab.name}
                    href={tab.path!}
                    className={`flex flex-col items-center justify-center flex-1 py-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      tab.active 
                        ? 'bg-[#059669]/5' 
                        : 'hover:bg-[#F3F4F6]'
                    }`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Left Sidebar - Soft Structuralism */}
        <aside className="w-56 bg-[#F9FAFB] border-r border-[#E5E7EB] hidden md:flex flex-col shrink-0 overflow-hidden relative z-10">
          
          {/* Brand & Search Area */}
          <div className="p-4 pb-3">
            <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition-opacity mb-6 group">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <span className="font-black text-lg tracking-tighter text-[#111827]">
                arogyavruksham <span className="block text-[10px] uppercase tracking-[0.2em] text-[#9CA3AF] font-bold mt-0.5">Admin</span>
              </span>
            </Link>

            <div className="relative w-full" ref={searchRef}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
                placeholder="Search..." 
                className="w-full pl-9 pr-8 py-2 bg-white border border-[#E5E7EB] rounded-[1rem] text-xs font-medium text-[#111827] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#059669]/5 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF] animate-spin" strokeWidth={1.5} />
              )}
              
              {/* Search Results Dropdown */}
              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden z-50 py-2 max-h-[60vh] overflow-y-auto">
                  {!isSearching && searchResults.products.length === 0 && searchResults.orders.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-[#9CA3AF] text-center font-medium">No results found.</div>
                  ) : (
                    <>
                      {searchResults.orders.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Orders</div>
                          {searchResults.orders.map((order: any) => (
                            <Link 
                              key={order.id} 
                              href="/admin/orders" 
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                              className="flex items-center justify-between px-4 py-2 hover:bg-[#F3F4F6] transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-[#111827]">#{order?.id?.split('-')[0]}</p>
                                <p className="text-xs text-[#6B7280] font-medium">{order.users?.full_name || 'Guest'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#111827]">₹{order.total_amount}</p>
                                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">{order.status}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-2 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Products</div>
                          {searchResults.products.map((product: any) => (
                            <Link 
                              key={product.id} 
                              href="/admin/products"
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-[#F3F4F6] transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-[#F3F4F6] shrink-0 overflow-hidden border border-[#E5E7EB] p-1">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover mix-blend-multiply rounded-lg" />
                                ) : (
                                  <Package className="w-5 h-5 m-1.5 text-gray-300" strokeWidth={1.5} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#111827] truncate">{product.title}</p>
                                <p className="text-xs text-[#6B7280] font-medium">₹{product.price}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 px-4 py-2 overflow-y-auto">
            {ADMIN_NAV_GROUPS.map((group) => {
              const items = navItems.filter((item) => item.group === group)
              if (items.length === 0) return null
              return (
                <div key={group} className="mb-6">
                  <p className="px-3 pb-2 text-[9px] font-bold uppercase tracking-widest text-[#9CA3AF]">{group}</p>
                  <div className="space-y-0.5">
                    {items.map((item: AdminNavItem) => {
                      const isActive = isNavActive(pathname, item)
                      const Icon = NAV_ICONS[item.icon] || Package
                      return (
                        <Link
                          key={item.path}
                          href={item.path}
                          title={item.description}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-[0.75rem] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                            isActive
                              ? 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-[#E5E7EB] text-[#111827] font-bold'
                              : 'hover:bg-[#059669]/5 text-[#6B7280] hover:text-[#111827] font-medium border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon className={`w-4 h-4 shrink-0 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-[#059669]' : 'text-[#9CA3AF]'}`} strokeWidth={isActive ? 2 : 1.5} />
                            <span className="truncate tracking-tight text-xs">{item.name}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* User & Lock Panel */}
          <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
            <button 
              onClick={handleAdminLogout} 
              className="group flex items-center justify-between w-full p-4 rounded-[1rem] bg-white border border-[#E5E7EB] hover:border-[#D1D5DB] shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-500 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-[#111827] leading-tight">Admin Session</p>
                  <p className="text-[10px] text-[#9CA3AF] font-medium">Click to lock</p>
                </div>
              </div>
              <LogOut className="w-4 h-4 text-gray-300 group-hover:text-[#4B5563] transition-colors" strokeWidth={1.5} />
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-white">
          
          {/* Top Header Bar (Mobile + Desktop Utilities) */}
          <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-[#E5E7EB] flex items-center justify-between px-6 lg:px-8 z-20 shrink-0 sticky top-0">
            <div className="flex items-center gap-4 md:hidden">
              {/* Mobile Brand */}
              <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E7EB] shadow-[0_2px_10px_rgb(0,0,0,0.02)] p-1 flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
              </div>
            </div>

            <div className="flex-1" />

            {/* Right Side Tools */}
            <div className="flex items-center gap-2">
              <div className="relative hidden sm:block" ref={appsRef}>
                <button
                  onClick={() => setShowApps(!showApps)}
                  className="w-10 h-10 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors flex items-center justify-center cursor-pointer"
                >
                  <LayoutGrid className="w-5 h-5" strokeWidth={1.5} />
                </button>
                {showApps && (
                  <div className="absolute right-0 mt-2 w-[400px] bg-white rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden z-50">
                    <div className="p-6 border-b border-[#E5E7EB]">
                      <p className="text-2xl font-black tracking-tighter text-[#111827]">Modules</p>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-2">
                      {navItems.map((item) => {
                        const Icon = NAV_ICONS[item.icon] || Package
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            onClick={() => setShowApps(false)}
                            className={`group rounded-2xl p-4 hover:bg-[#F3F4F6] transition-all duration-500 border border-transparent hover:border-[#E5E7EB] ${isNavActive(pathname, item) ? 'bg-[#F3F4F6] border-[#E5E7EB]' : ''}`}
                          >
                            <div className="w-8 h-8 rounded-xl bg-white border border-[#E5E7EB] shadow-[0_2px_8px_rgb(0,0,0,0.02)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                              <Icon className="w-4 h-4 text-[#111827]" strokeWidth={1.5} />
                            </div>
                            <span className="block text-sm font-bold text-[#111827] mb-1 tracking-tight">{item.name}</span>
                            <p className="text-xs text-[#6B7280] font-medium leading-relaxed line-clamp-2">{item.description}</p>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={notificationsRef}>
                <button 
                  onClick={() => {
                    setShowNotifications(!showNotifications)
                    if (!showNotifications) setUnreadCount(0)
                  }}
                  className="w-10 h-10 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors relative flex items-center justify-center cursor-pointer"
                >
                  <Bell className="w-5 h-5" strokeWidth={1.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-[#059669] text-white shadow-sm border-0 font-bold text-[9px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-[400px] bg-white rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.08)] border border-[#E5E7EB] overflow-hidden z-50">
                    <div className="p-6 border-b border-[#E5E7EB] flex justify-between items-end">
                      <div>
                        <h4 className="text-2xl font-black tracking-tighter text-[#111827]">Activity</h4>
                        <p className="text-xs text-[#9CA3AF] font-medium mt-1">Live order feed</p>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center text-[#9CA3AF] text-sm font-medium">
                          It's quiet in here.
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const timeStr = notif.created_at 
                            ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : '';
                          return (
                            <div 
                              key={notif.id}
                              onClick={() => {
                                setShowNotifications(false);
                                router.push('/admin/orders');
                              }}
                              className="p-4 hover:bg-[#F3F4F6] transition-colors cursor-pointer flex items-start gap-4 border-b border-[#E5E7EB] last:border-0 group"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                notif.status === 'pending' ? 'bg-[#059669] text-white shadow-sm border-0 border-[#059669]' : 'bg-white text-[#9CA3AF] border-[#E5E7EB] shadow-[0_2px_8px_rgb(0,0,0,0.02)]'
                              }`}>
                                <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex justify-between items-baseline gap-2">
                                  <p className="font-bold text-[#111827] text-sm truncate group-hover:underline transition-colors tracking-tight">
                                    Order #{notif.id.slice(0, 8)}
                                  </p>
                                  <span className="text-xs text-[#9CA3AF] shrink-0 font-medium">{timeStr}</span>
                                </div>
                                <p className="text-sm text-[#6B7280] truncate mt-0.5 font-medium">
                                  {notif.shipping_address?.name || notif.users?.full_name || 'Customer'}
                                </p>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="font-black text-[#111827] text-sm">
                                    ₹{Number(notif.total_amount || 0).toLocaleString('en-IN')}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-[#F3F4F6] border border-[#E5E7EB] text-[#4B5563]">
                                    {notif.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Menu */}
              <button 
                className="md:hidden w-10 h-10 rounded-full text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#111827] flex items-center justify-center"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto min-h-0">
            <div className="w-full max-w-[1600px] mx-auto px-4 py-6 md:px-8 md:py-8 lg:px-10 pb-40 md:pb-10">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-white/80 backdrop-blur-xl" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-[80vw] max-w-sm bg-white shadow-2xl flex flex-col border-l border-[#E5E7EB] animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
            <div className="p-6 flex justify-between items-center border-b border-[#E5E7EB]">
              <span className="font-black text-2xl tracking-tighter text-[#111827]">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center text-[#9CA3AF] hover:text-[#111827] bg-[#F3F4F6] rounded-full">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 px-6 py-8 space-y-2 text-sm font-medium overflow-y-auto">
              {navItems.map((item) => {
                const isActive = isNavActive(pathname, item)
                const Icon = NAV_ICONS[item.icon] || Package
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex flex-col p-4 rounded-2xl transition-all ${
                      isActive
                        ? 'bg-[#F3F4F6] border border-[#E5E7EB]'
                        : 'hover:bg-[#F3F4F6]'
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-white shadow-[0_2px_8px_rgb(0,0,0,0.02)]' : 'bg-transparent'}`}>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#059669]' : 'text-[#9CA3AF]'}`} strokeWidth={1.5} />
                      </div>
                      <span className={`text-base tracking-tight ${isActive ? 'font-bold text-[#111827]' : 'text-[#4B5563]'}`}>{item.name}</span>
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

      {/* ═══ GLOBAL TOAST ═══ */}
      {toast.visible && (
        <div className="fixed bottom-6 right-6 z-[200] animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#111827] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border border-gray-800">
            <Bell className="w-5 h-5 text-[#A4E4BA]" strokeWidth={1.5} />
            {toast.message}
          </div>
        </div>
      )}
    </div>
  )
}
