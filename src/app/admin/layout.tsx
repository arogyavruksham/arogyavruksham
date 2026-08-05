'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Settings, LogOut, ShoppingCart, Users, ShieldCheck, Menu, X, BarChart2, Tag, Archive, TrendingUp, Mail, Calendar, Bell, Search, ChevronRight, Loader2, ShoppingBag, Megaphone, Lock, LayoutGrid, User, ChevronDown, Sparkles } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AdminLockScreen } from '@/components/admin/AdminLockScreen'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

const PottedPlantIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v5a5 5 0 0 0 10 0v-5" />
    <path d="M5 7h14l-1 4H6Z" />
    <path d="M12 7V3" />
    <path d="M8 5c1 0 2-1 2-2" />
    <path d="M16 5c-1 0-2-1-2-2" />
  </svg>
)

const DashboardGridIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 3h8v10H3V3zm10 0h8v6h-8V3zM3 15h8v6H3v-6zm10-4h8v10h-8V11z" />
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
  const [unreadCount, setUnreadCount] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef, notificationsRef])

  // Live order notifications
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

    const channel = supabase.channel('admin_header_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdminUnlocked])

  // Perform search
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <ShieldCheck className="w-16 h-16 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-500">You do not have administrator privileges.</p>
        <Link href="/" className="text-blue-600 hover:underline">Return Home</Link>
      </div>
    )
  }

  if (!isAdminUnlocked) {
    return (
      <div className="flex flex-col min-h-screen">
        <AdminLockScreen />
      </div>
    )
  }

  const handleAdminLogout = () => {
    setAdminUnlocked(false)
    router.push('/profile')
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FB] overflow-hidden font-sans">
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-200 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-[70px] px-2 max-w-md mx-auto">
          {[
            { name: 'Dashboard', path: '/admin', icon: DashboardGridIcon, active: pathname === '/admin' },
            { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, active: pathname?.startsWith('/admin/orders') },
            { name: 'Inventory', path: '/admin/inventory', icon: PottedPlantIcon, active: pathname?.startsWith('/admin/inventory') },
            { name: 'Lock Panel', onClick: handleAdminLogout, icon: Lock, active: false },
          ].map((tab) => {
            const Icon = tab.icon;
            const content = (
              <>
                <Icon className={`w-5 h-5 mb-0.5 ${tab.active ? 'text-[#FF6B26]' : 'text-gray-500'}`} />
                <span className={`text-[11px] tracking-tight ${tab.active ? 'font-black text-[#E55B18]' : 'font-semibold text-gray-500'}`}>
                  {tab.name}
                </span>
              </>
            );

            if (tab.onClick) {
              return (
                <button
                  key={tab.name}
                  onClick={tab.onClick}
                  className="flex flex-col items-center justify-center transition-all text-gray-500 hover:text-red-600 py-1.5 px-3 font-medium min-w-[72px] cursor-pointer"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link 
                key={tab.name}
                href={tab.path!}
                className={`flex flex-col items-center justify-center transition-all ${
                  tab.active 
                    ? 'bg-[#FFF6F0] text-[#FF6B26] py-1.5 px-3 sm:px-4 rounded-full font-bold shadow-2xs border border-[#FFE1D1] min-w-[76px]' 
                    : 'text-gray-500 hover:text-gray-800 py-1.5 px-3 font-medium min-w-[72px]'
                }`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Top Header Bar - Clean style without center navigation icons */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 z-20 shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 shadow-2xs p-1 flex items-center justify-center shrink-0">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <span className="font-sans font-black text-xl tracking-tight text-gray-900 flex items-center">
              arogyavruksham <span className="ml-2 text-xs font-bold px-2 py-0.5 bg-[#FFF6F0] text-[#FF6B26] rounded-md border border-[#FFE1D1] hidden sm:inline-block">Admin</span>
            </span>
          </Link>
        </div>

        {/* Clean Center - No icons as requested by user */}
        <div className="flex-1"></div>

        {/* Right Side Tools & Icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors hidden sm:flex items-center justify-center cursor-pointer" title="Apps & Shortcuts">
            <LayoutGrid className="w-5 h-5" />
          </button>
          
          {/* Notifications Bell */}
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications)
                if (!showNotifications) setUnreadCount(0)
              }}
              className="p-2.5 rounded-full text-gray-600 hover:bg-gray-100 transition-colors relative flex items-center justify-center cursor-pointer"
              title="Order Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#FF6B26] text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#FF6B26]" />
                    <h4 className="font-bold text-gray-900 text-sm">New Order Notifications</h4>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFF6F0] text-[#FF6B26] border border-[#FFE1D1] px-2 py-0.5 rounded-full">
                    Live Feed
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs italic">
                      No recent orders received.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const timeStr = notif.created_at 
                        ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';
                      const dateStr = notif.created_at 
                        ? new Date(notif.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                        : '';
                      return (
                        <div 
                          key={notif.id}
                          onClick={() => {
                            setShowNotifications(false);
                            router.push('/admin/orders');
                          }}
                          className="p-3.5 hover:bg-orange-50/40 transition-colors cursor-pointer flex items-start gap-3 group"
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.status === 'pending' ? 'bg-[#FFF6F0] text-[#FF6B26] border border-[#FFE1D1]' : 'bg-gray-50 text-gray-500 border border-gray-100'
                          }`}>
                            <ShoppingBag className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline gap-2">
                              <p className="font-bold text-gray-900 text-xs truncate group-hover:text-[#FF6B26] transition-colors">
                                Order #{notif.id.slice(0, 8).toUpperCase()}
                              </p>
                              <span className="text-[10px] text-gray-400 shrink-0 font-mono">{dateStr}, {timeStr}</span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-0.5">
                              By {notif.shipping_address?.name || notif.users?.full_name || 'Customer'}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="font-black text-gray-900 text-xs">
                                ₹{Number(notif.total_amount || 0).toLocaleString('en-IN')}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                                notif.status === 'pending' ? 'bg-[#FFF6F0] text-[#FF6B26] border border-[#FFE1D1]' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notif.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-200 text-center">
                  <Link 
                    href="/admin/orders" 
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-[#FF6B26] hover:underline flex items-center justify-center gap-1"
                  >
                    View All Orders <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Button */}
          <button className="w-9 h-9 bg-[#FFF6F0] text-[#FF6B26] border border-[#FFE1D1] rounded-full shadow-xs flex items-center justify-center font-black text-sm hover:bg-orange-100/60 transition-colors" title="Account">
            {user?.email?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
          </button>
          
          {/* Mobile Hamburger Menu */}
          <button 
            className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container below header */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Left Sidebar - Clean white with Search at top */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 overflow-y-auto">
          
          {/* Sidebar Top Search Input Box */}
          <div className="p-4 pb-3" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
                placeholder="Search..." 
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#FF6B26] focus:ring-1 focus:ring-[#FF6B26] transition-all shadow-2xs"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              )}
              
              {/* Search Results Dropdown */}
              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50 py-2 max-h-[60vh] overflow-y-auto">
                  {!isSearching && searchResults.products.length === 0 && searchResults.orders.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-gray-500 text-center">No results for "{searchQuery}"</div>
                  ) : (
                    <>
                      {searchResults.orders.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">Orders</div>
                          {searchResults.orders.map((order: any) => (
                            <Link 
                              key={order.id} 
                              href="/admin/orders" 
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                              className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <p className="text-xs font-bold text-gray-900">#{order.id.split('-')[0]}</p>
                                <p className="text-[11px] text-gray-500">{order.users?.full_name || 'Guest'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-[#FF6B26]">₹{order.total_amount}</p>
                                <span className="text-[9px] font-bold text-gray-400 uppercase">{order.status}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-1.5 text-[11px] font-black text-gray-400 uppercase tracking-wider bg-gray-50">Products</div>
                          {searchResults.products.map((product: any) => (
                            <Link 
                              key={product.id} 
                              href="/admin/products"
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); }}
                              className="flex items-center gap-2.5 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-8 h-8 rounded bg-gray-100 shrink-0 overflow-hidden">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
                                ) : (
                                  <Package className="w-4 h-4 m-2 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-gray-900 truncate">{product.title}</p>
                                <p className="text-[11px] text-gray-500">₹{product.price}</p>
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

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-2 space-y-1 text-sm font-medium overflow-y-auto">
            {[
              { name: 'Get Started', path: '/admin', icon: Sparkles },
              { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
              { name: 'Products', path: '/admin/products', icon: Package, chevron: true },
              { name: 'Orders & Sales', path: '/admin/orders', icon: ShoppingCart, chevron: true },
              { name: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
              { name: 'Inventory', path: '/admin/inventory', icon: Archive },
              { name: 'Categories', path: '/admin/categories', icon: ShoppingBag },
              { name: 'Customers', path: '/admin/customers', icon: Users },
              { name: 'Announcement', path: '/admin/announcement', icon: Megaphone },
              { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
              { name: 'Settings', path: '/admin/settings', icon: Settings },
            ].filter(item => {
              if (user?.role === 'editor') return ['Products', 'Inventory'].includes(item.name);
              if (user?.role === 'manager') return item.name !== 'Analytics';
              return true;
            }).map((item) => {
              const isActive = pathname === item.path
              return (
                <Link 
                  key={item.name}
                  href={item.path} 
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#FFF6F0] text-[#FF6B26] font-bold shadow-2xs border border-[#FFE1D1]' 
                      : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B26]' : 'text-gray-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.chevron ? (
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6B26]' : 'text-gray-400'}`} />
                  ) : isActive ? (
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B26]" />
                  ) : null}
                </Link>
              )
            })}
          </nav>

          {/* Clean footer - No partner ad banners */}
          <div className="p-3 border-t border-gray-100 mt-auto">
            <button 
              onClick={handleAdminLogout} 
              className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors text-sm font-medium cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
              <span>Lock Admin Panel</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8F9FB] p-4 md:p-8 pb-24 md:pb-12">
          <div className="w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-xs" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-2xl flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <span className="font-black text-lg text-gray-900">Admin Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-800 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-3 border-b border-gray-100">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search orders or products..." 
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-xs text-gray-700 outline-none"
                />
              </div>
            </div>

            <nav className="flex-1 px-3 py-3 space-y-1 text-sm font-medium overflow-y-auto">
              {[
                { name: 'Get Started', path: '/admin', icon: Sparkles },
                { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
                { name: 'Products', path: '/admin/products', icon: Package },
                { name: 'Orders & Sales', path: '/admin/orders', icon: ShoppingCart },
                { name: 'Offers & Coupons', path: '/admin/offers', icon: Tag },
                { name: 'Inventory', path: '/admin/inventory', icon: Archive },
                { name: 'Categories', path: '/admin/categories', icon: ShoppingBag },
                { name: 'Customers', path: '/admin/customers', icon: Users },
                { name: 'Announcement', path: '/admin/announcement', icon: Megaphone },
                { name: 'Newsletter', path: '/admin/newsletter', icon: Mail },
                { name: 'Settings', path: '/admin/settings', icon: Settings },
              ].map((item) => {
                const isActive = pathname === item.path
                return (
                  <Link 
                    key={item.name}
                    href={item.path} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#FFF6F0] text-[#FF6B26] font-bold border border-[#FFE1D1]' 
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? 'text-[#FF6B26]' : 'text-gray-400'}`} /> 
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => { setIsMobileMenuOpen(false); handleAdminLogout(); }} 
                className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm"
              >
                <LogOut className="w-4 h-4 text-gray-400" /> Lock Panel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
