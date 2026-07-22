'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, Settings, LogOut, ShoppingCart, Users, ShieldCheck, Menu, X, BarChart2, Tag, Archive, TrendingUp, Mail, Calendar, Bell, Search, ChevronRight, Loader2, ShoppingBag } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { AdminLockScreen } from '@/components/admin/AdminLockScreen'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAdminUnlocked, setAdminUnlocked } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<{ products: any[], orders: any[] }>({ products: [], orders: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
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
    // If not logged in at all, kick to home
    if (mounted && !user) {
      router.push('/')
    }

    // Role-based redirects
    if (mounted && user) {
      if (user.role === 'editor' && pathname !== '/admin/products' && pathname !== '/admin/inventory') {
        router.push('/admin/products')
      } else if (user.role === 'manager' && pathname === '/admin/analytics') {
        router.push('/admin')
      }
    }
  }, [mounted, user, pathname, router])

  if (!mounted) return null

  // If logged in, but not an admin, manager, or editor, kick to home
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

  // If admin email but hasn't entered secondary password
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      
      {/* Admin Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111827] text-gray-400 border-t border-gray-800 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {user?.role !== 'editor' && (
            <Link href="/admin" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/admin' ? 'text-white' : 'hover:text-gray-200'}`}>
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-[10px] font-medium">Dash</span>
            </Link>
          )}
          {user?.role !== 'editor' && (
            <Link href="/admin/orders" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/admin/orders' ? 'text-white' : 'hover:text-gray-200'}`}>
              <ShoppingCart className="w-5 h-5" />
              <span className="text-[10px] font-medium">Orders</span>
            </Link>
          )}
          <Link href="/admin/products" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/admin/products' ? 'text-white' : 'hover:text-gray-200'}`}>
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-medium">Products</span>
          </Link>
          {user?.role === 'editor' && (
            <Link href="/admin/inventory" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/admin/inventory' ? 'text-white' : 'hover:text-gray-200'}`}>
              <Archive className="w-5 h-5" />
              <span className="text-[10px] font-medium">Inventory</span>
            </Link>
          )}
          <button onClick={handleAdminLogout} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-red-400 hover:text-red-300">
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-medium">Lock</span>
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-[#F0F5F5] text-gray-700 hidden md:flex flex-col shrink-0 border-r border-gray-200">
        <div className="p-6 pb-4 flex justify-center text-center">
          <Link href="/" className="block">
            <img src="/text_logo.png" alt="Arogyavruksham Silks" className="h-8 md:h-10 lg:h-14 w-auto max-w-full object-contain drop-shadow-sm" />
          </Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1.5 font-sans text-sm font-medium overflow-y-auto">
          {[
            { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
            { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
            { name: 'Products', path: '/admin/products', icon: Package },
            { name: 'Offers', path: '/admin/offers', icon: Tag },
            { name: 'Inventory', path: '/admin/inventory', icon: Archive },
            { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
            { name: 'Categories', path: '/admin/categories', icon: ShoppingBag },
            { name: 'Customer', path: '/admin/customers', icon: Users },
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
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#51D3B7] text-white shadow-sm font-semibold' : 'hover:bg-gray-200/50 hover:text-gray-900 text-gray-600'}`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" /> {item.name}
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button onClick={handleAdminLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" /> Lock Panel
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8FAFC]">
        {/* Top Header */}
        <header className="h-16 md:h-20 bg-[#F8FAFC] flex items-center justify-between px-4 md:px-8 shrink-0 relative">
          
          {/* Title (Hidden on mobile if search is open) */}
          <div className={`shrink-0 md:w-1/4 ${isMobileSearchOpen ? 'hidden md:block' : 'block z-10'}`}>
            <h2 className="font-bold text-xl md:text-2xl text-gray-900 truncate max-w-[100px] md:max-w-none">
              {pathname === '/admin' ? 'Overview' : pathname.replace('/admin/', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h2>
          </div>

          {/* Mobile Centered Logo */}
          <div className={`flex-1 flex justify-center px-2 md:hidden overflow-hidden ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
            <img src="/text_logo.png" alt="Arogyavruksham Silks" className="h-6 md:h-8 w-auto max-w-[140px] object-contain" />
          </div>
          
          {/* Search Bar */}
          <div className={`flex-1 flex justify-center px-2 md:px-8 ${isMobileSearchOpen ? 'block' : 'hidden md:flex'}`}>
            <div className="relative w-full max-w-xl" ref={searchRef}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true) }}
                placeholder="Search..." 
                className="w-full pl-4 pr-10 py-2 md:py-2.5 bg-white border border-gray-200 md:border-none rounded-xl shadow-sm focus:ring-2 focus:ring-[#51D3B7] outline-none text-sm text-gray-700"
              />
              {isSearching ? (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              )}
              
              {/* Search Dropdown */}
              {showDropdown && searchQuery.trim() !== '' && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 py-2 max-h-[70vh] overflow-y-auto">
                  {!isSearching && searchResults.products.length === 0 && searchResults.orders.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 text-center">No results found for "{searchQuery}"</div>
                  ) : (
                    <>
                      {searchResults.orders.length > 0 && (
                        <div className="mb-2">
                          <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Orders</div>
                          {searchResults.orders.map((order: any) => (
                            <Link 
                              key={order.id} 
                              href="/admin/orders" 
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); setIsMobileSearchOpen(false) }}
                              className="flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-900">#{order.id.split('-')[0]}</p>
                                <p className="text-xs text-gray-500">{order.users?.full_name || 'Guest'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-[#51D3B7]">₹{order.total_amount}</p>
                                <span className="text-[10px] font-bold text-gray-500 uppercase">{order.status}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                      
                      {searchResults.products.length > 0 && (
                        <div>
                          <div className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-50">Products</div>
                          {searchResults.products.map((product: any) => (
                            <Link 
                              key={product.id} 
                              href="/admin/products"
                              onClick={() => { setShowDropdown(false); setSearchQuery(''); setIsMobileSearchOpen(false) }}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
                                ) : (
                                  <Package className="w-5 h-5 m-2.5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{product.title}</p>
                                <p className="text-xs text-gray-500">₹{product.price}</p>
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

          <div className="flex items-center justify-end gap-1 md:gap-3 w-1/3 md:w-1/4">
            
            {/* Mobile Search Toggle */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            >
              {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </button>

            <div className="hidden lg:flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-sm border border-gray-100">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </div>
            
            {/* Live Notifications Bell */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => {
                  setShowNotifications(!showNotifications)
                  if (!showNotifications) setUnreadCount(0)
                }}
                className="flex bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 text-gray-500 hover:text-gray-900 relative transition-colors cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-black text-[10px] min-w-[20px] h-[20px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-left">
                  <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#51D3B7]" />
                      <h4 className="font-bold text-gray-900 text-sm">New Order Notifications</h4>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#51D3B7]/10 text-[#2db395] px-2 py-0.5 rounded-full">
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
                            className="p-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-start gap-3 group"
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              notif.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-200/60' : 'bg-gray-50 text-gray-500 border border-gray-100'
                            }`}>
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline gap-2">
                                <p className="font-bold text-gray-900 text-xs truncate group-hover:text-[#1A73E8] transition-colors">
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
                                  notif.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-600'
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

                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                    <Link 
                      href="/admin/orders" 
                      onClick={() => setShowNotifications(false)}
                      className="text-xs font-bold text-[#1A73E8] hover:underline flex items-center justify-center gap-1"
                    >
                      View All Orders <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Logo */}
            <button className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center font-bold text-[#51D3B7]">
              {user?.email?.charAt(0).toUpperCase() || 'A'}
            </button>
            
            {/* Hamburger Menu (Mobile Only) */}
            <button 
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-[#F0F5F5] shadow-xl flex flex-col transform transition-transform border-l border-gray-200">
            <div className="p-4 flex justify-between items-center border-b border-gray-200 bg-white">
              <span className="font-bold text-lg text-gray-900">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-4 space-y-1.5 font-sans text-sm font-medium overflow-y-auto">
              {[
                { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
                { name: 'Analytics', path: '/admin/analytics', icon: BarChart2 },
                { name: 'Products', path: '/admin/products', icon: Package },
                { name: 'Offers', path: '/admin/offers', icon: Tag },
                { name: 'Inventory', path: '/admin/inventory', icon: Archive },
                { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
                { name: 'Categories', path: '/admin/categories', icon: ShoppingBag },
                { name: 'Customer', path: '/admin/customers', icon: Users },
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-[#51D3B7] text-white shadow-sm font-semibold' : 'hover:bg-gray-200/50 hover:text-gray-900 text-gray-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" /> {item.name}
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}

    </div>
  )
}
