'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, User, Search, MapPin, ChevronDown, X, LogOut, LayoutDashboard, ChevronLeft, Heart, Leaf } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AddressModal } from './AddressModal'
import { useCategories, normalizeProducts } from '@/lib/categories'
import { usePathname, useRouter } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  const categories = useCategories()
  const { items, toggleCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [defaultCity, setDefaultCity] = useState<string | null>(null)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const diff = y - lastScrollY.current
    if (y > 80) {
      if (diff > 5) {
        setHidden(true)
      } else if (diff < -5) {
        setHidden(false)
      }
    } else {
      setHidden(false)
    }
    setIsScrolled(y > 10)
    lastScrollY.current = y
  })

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
      setIsMobileMenuOpen(false)
      setShowSearchDropdown(false)
      setSearchQuery('')
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.profile-dropdown-container')) setIsProfileDropdownOpen(false)
      if (!target.closest('.search-container')) setShowSearchDropdown(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) { setSearchResults([]); setShowSearchDropdown(false); return }
      setIsSearching(true); setShowSearchDropdown(true)
      const { data } = await supabase.from('products').select('*')
        .or(`title.ilike.%${searchQuery.trim()}%,category.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`)
        .limit(5)
      setSearchResults(normalizeProducts(data || []))
      setIsSearching(false)
    }
    const id = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  useEffect(() => {
    setMounted(true)
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
    const handleStorageChange = () => setProfilePhoto(localStorage.getItem('profilePhoto'))
    window.addEventListener('storage', handleStorageChange)

    async function fetchDefaultCity() {
      if (isAuthenticated) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase.from('user_addresses').select('city').eq('user_id', user.id).eq('is_default', true).maybeSingle()
            if (data?.city) setDefaultCity(data.city)
            else {
              const { data: first } = await supabase.from('user_addresses').select('city').eq('user_id', user.id).limit(1).maybeSingle()
              setDefaultCity(first?.city || null)
            }
          }
        } catch (error) { console.error('Error fetching city:', error) }
      } else { setDefaultCity(null) }
    }

    fetchDefaultCity()
    window.addEventListener('addressUpdated', fetchDefaultCity)
    return () => window.removeEventListener('addressUpdated', fetchDefaultCity)
  }, [isAuthenticated])

  if (pathname?.startsWith('/admin')) return null

  const navVariants = {
    visible: { y: 0, transition: { duration: 0.35, ease: 'easeInOut' as const } },
    hidden: { y: '-100%', transition: { duration: 0.35, ease: 'easeInOut' as const } },
  }

  return (
    <motion.header
      variants={navVariants}
      animate={hidden ? 'hidden' : 'visible'}
      className={`fixed top-0 left-0 right-0 z-50 w-full flex-col ${pathname === '/checkout' ? 'hidden md:flex' : 'flex'} transition-shadow duration-300 ${isScrolled ? 'shadow-lg backdrop-blur-md bg-white/95' : 'bg-white'}`}
    >
      {/* Top Strip */}
      <div className="hidden md:flex w-full bg-primary text-white text-xs py-1.5 px-8 items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 opacity-90"><Leaf className="w-3 h-3" /> Free delivery on orders above ₹999</span>
          <span className="opacity-70">|</span>
          <span className="opacity-90">100% Authentic Plants Guaranteed</span>
        </div>
        <div className="flex items-center gap-4 opacity-90">
          <span>📞 034 7333 3444</span>
          <span>IN | ₹</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className={`w-full border-b border-border`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile */}
          <div className="flex md:hidden items-center justify-between w-full h-14 relative">
            <Link href="/" className="flex items-center">
              <img src="/logo.svg" alt="Arogyavruksham" className="max-h-16 max-w-[180px] object-contain" />
            </Link>
            <div className="flex items-center gap-2">
              <motion.button whileTap={{ scale: 0.9 }} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(true)}>
                <Search className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => { if (isAuthenticated) router.push('/profile'); else useAuthStore.getState().setAuthModalOpen(true) }}
                className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors relative"
              >
                {mounted && isAuthenticated && profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-5 h-5 rounded-full object-cover" /> : <User className="w-5 h-5" />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} onClick={toggleCart} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {mounted && itemCount > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white">
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center justify-between w-full h-18 py-3 gap-4 lg:gap-6 relative">
            {/* Left: Tablet hamburger */}
            <div className="flex lg:hidden items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><Menu className="w-5 h-5" /></button>
              <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"><Search className="w-5 h-5" /></button>
            </div>

            {/* Logo */}
            <div className="flex items-center shrink-0 lg:static absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0 z-10">
              <Link href="/" className="flex items-center gap-2">
                <motion.img whileHover={{ scale: 1.03 }} src="/logo.svg" alt="Arogyavruksham" className="max-h-12 lg:max-h-16 max-w-[180px] lg:max-w-[260px] object-contain" />
              </Link>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md relative mx-4 search-container">
              <input
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true) }}
                placeholder="Search for plants, pots..."
                className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-light transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[60vh] overflow-y-auto py-2">
                        {searchResults.map((product) => (
                          <div key={product.id} onClick={() => { router.push(`/shop/${product.id}`); setShowSearchDropdown(false); setSearchQuery('') }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors">
                            <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded-md border border-gray-100" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-semibold text-gray-900 truncate">{product.title}</span>
                              <span className="text-xs text-gray-500">{product.category} • ₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 mt-2">
                          <button type="button" onClick={() => handleSearch()} className="w-full py-3 text-sm font-semibold text-primary hover:bg-gray-50 transition-colors">
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="hidden lg:flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors" onClick={() => setIsAddressModalOpen(true)}>
                <MapPin className="w-4 h-4 text-gray-500" />
                <div className="flex flex-col leading-tight">
                  <span className="text-xs text-gray-500">Delivering to</span>
                  <span className="font-semibold text-gray-900 text-xs">{mounted && defaultCity ? defaultCity : 'Select Address'}</span>
                </div>
              </div>

              <motion.button whileTap={{ scale: 0.92 }} id="nav-cart-icon"
                className="flex items-center gap-2 text-foreground hover:text-primary transition-colors relative border-l pl-4 border-gray-200"
                aria-label="Cart" onClick={toggleCart}>
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <AnimatePresence>
                    {mounted && itemCount > 0 && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-white shadow-sm">
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <span className="text-sm font-semibold hidden xl:inline">Cart</span>
              </motion.button>

              {mounted && isAuthenticated ? (
                <div className="relative profile-dropdown-container border-l pl-4 border-gray-200">
                  <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 text-foreground hover:text-primary transition-colors focus:outline-none" aria-label="Account">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center overflow-hidden border border-primary-light shrink-0 font-bold text-sm shadow-sm">
                      {profilePhoto ? <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : (user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U')}
                    </div>
                    <div className="flex flex-col leading-tight text-left hidden xl:flex">
                      <span className="text-xs text-gray-500">Welcome</span>
                      <span className="text-sm font-semibold">{user?.name.split(' ')[0]}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform hidden xl:block ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        className="absolute top-full right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link href="/profile?tab=dashboard" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                          </Link>
                          <Link href="/profile?tab=history" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors">
                            <ShoppingBag className="w-4 h-4 text-gray-400" /> My Orders
                          </Link>
                        </div>
                        <div className="p-2 border-t border-gray-100">
                          <button onClick={() => { setIsProfileDropdownOpen(false); useAuthStore.getState().logout() }}
                            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => useAuthStore.getState().setAuthModalOpen(true)}
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors border-l pl-4 border-gray-200" aria-label="Account">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-col leading-tight text-left hidden xl:flex">
                    <span className="text-xs text-gray-500">Sign In</span>
                    <span className="text-sm font-semibold">Account</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navbar (Categories) */}
      <div className="hidden md:block w-full bg-white border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 overflow-x-auto scrollbar-hide h-10 text-sm font-medium text-gray-600 whitespace-nowrap">
            <Link href="/shop" className="flex items-center gap-2 font-bold text-gray-900 hover:text-primary transition-colors shrink-0">
              <Menu className="w-4 h-4 text-primary" /> All Categories
            </Link>
            {categories.map((cat, idx) => (
              <Link key={idx} href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="hover:text-primary transition-colors font-semibold text-gray-700 shrink-0 relative group py-2">
                {cat.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-4 shrink-0 pl-4">
              <Link href="/shop?sale=true" className="flex items-center gap-1 text-secondary font-bold hover:text-secondary-light transition-colors">
                🔥 Best Deals
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex md:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="relative ml-auto w-full max-w-sm h-full bg-white flex flex-col shadow-2xl overflow-y-auto">
              <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100 sticky top-0 z-10">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors shrink-0">
                  <X className="w-6 h-6" />
                </button>
                <form onSubmit={handleSearch} className="relative w-full">
                  <div className="relative flex items-center w-full bg-white border border-primary rounded-full px-4 py-2">
                    <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search plants..." className="w-full bg-transparent text-sm focus:outline-none" autoFocus />
                  </div>
                </form>
              </div>

              <div className="flex-1 p-4 space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Categories</h3>
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat, i) => (
                      <Link key={i} href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} onClick={() => setIsMobileMenuOpen(false)}
                        className="flex flex-col items-center gap-2 shrink-0 w-16">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 bg-gray-100">
                          {cat.image ? <img src={cat.image} alt="" className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-gray-700">{cat.name.slice(0, 3)}</span>}
                        </div>
                        <span className="text-xs font-bold text-gray-800 text-center truncate w-full">{cat.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Top Searches */}
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Popular Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Monstera', 'Snake Plant', 'Terracotta Pots', 'Indoor', 'Succulents'].map((term, i) => (
                      <button key={i} onClick={() => { setSearchQuery(term); handleSearch() }}
                        className="px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-xs font-medium text-primary">
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-widest text-gray-400 mb-3">Quick Links</h3>
                  <div className="space-y-1">
                    {[{ label: 'Shop All Plants', href: '/shop' }, { label: 'New Arrivals', href: '/shop?sort=new' }, { label: 'Best Deals', href: '/shop?sale=true' }].map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 text-sm font-medium text-gray-800">
                        {link.label} <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {mounted && <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />}
    </motion.header>
  )
}
