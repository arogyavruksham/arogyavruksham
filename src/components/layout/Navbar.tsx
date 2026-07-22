'use client'

import Link from 'next/link'
import { ShoppingBag, User, Search, ChevronDown, X, Phone } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AddressModal } from './AddressModal'
import { usePathname, useRouter } from 'next/navigation'

const navLinks = [
  { label: 'HOME', href: '/' },
  { label: 'SHOP', href: '/shop' },
  { label: 'PORTFOLIO', href: '/portfolio' },
]
const navLinksRight = [
  { label: 'BLOGS', href: '/blogs' },
  { label: 'FEATURES', href: '/features' },
  { label: 'PAGES', href: '/pages' },
]

export function Navbar() {
  const pathname = usePathname()
  const { items, toggleCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()
  const lastScrollY = useRef(0)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const diff = y - lastScrollY.current
    if (y > 80) {
      if (diff > 5) setHidden(true)
      else if (diff < -5) setHidden(false)
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
        .or(`title.ilike.%${searchQuery.trim()}%,category.ilike.%${searchQuery.trim()}%`)
        .limit(5)
      setSearchResults(data || [])
      setIsSearching(false)
    }
    const id = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(id)
  }, [searchQuery])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (pathname?.startsWith('/admin')) return null

  // Cart total (approximate display)
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <>
      {/* Spacer so content below doesn't hide under navbar */}
      <div className="h-[60px] xl:h-[100px]" />

      <motion.header
        animate={{ y: hidden ? '-100%' : '0%' }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`fixed top-0 left-0 right-0 z-50 ${pathname === '/checkout' ? 'hidden md:block' : 'block'}`}
      >
        {/* ─── DESKTOP ─── */}
        <div className={`hidden xl:flex w-full items-center border-b border-gray-100 overflow-visible transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'}`}
          style={{ height: '100px' }}>
          
          <div className="w-full max-w-full mx-auto px-6 lg:px-12 flex items-center overflow-visible h-full">

            {/* ── Far Left: Currency + Phone ── */}
            <div className="flex items-center gap-6 shrink-0 w-[300px]">
              <span className="text-[12px] font-bold text-gray-700 tracking-wide cursor-pointer hover:text-primary transition-colors uppercase">
                USD | EN
              </span>
              <div className="w-px h-5 bg-gray-200" />
              <span className="flex items-center gap-2 text-[12px] font-bold text-gray-700">
                <Phone className="w-3.5 h-3.5 text-gray-700" />
                034 2333 3444
              </span>
            </div>

            {/* ── Left Nav Links ── */}
            <nav className="flex items-center justify-end gap-10 flex-1 pr-12 shrink-0 h-full">
              {navLinks.map(({ label, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
                return (
                  <Link key={href} href={href}
                    className={`relative flex items-center gap-1.5 h-full text-[13px] font-bold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                    {label}
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-gray-600'}`} />
                    {/* Active Bottom Border */}
                    {isActive && (
                      <motion.div layoutId="activeNavIndicatorLeft" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* ── CENTER: Breakout Logo ── */}
            <div className="relative flex justify-center items-center shrink-0 w-[140px] z-20">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center mt-1">
                <Link href="/" className="block">
                  <motion.img
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    src="/logo.png"
                    alt="Arogyavruksham"
                    className="w-[125px] h-[125px] drop-shadow-md object-contain"
                  />
                </Link>
              </div>
            </div>

            {/* ── Right Nav Links ── */}
            <nav className="flex items-center justify-start gap-10 flex-1 pl-12 shrink-0 h-full">
              {navLinksRight.map(({ label, href }) => {
                const isActive = pathname === href || (href !== '/' && pathname?.startsWith(href))
                return (
                  <Link key={href} href={href}
                    className={`relative flex items-center gap-1.5 h-full text-[13px] font-bold tracking-wide transition-colors ${isActive ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                    {label}
                    <ChevronDown className={`w-3.5 h-3.5 ${isActive ? 'text-primary' : 'text-gray-600'}`} />
                    {/* Active Bottom Border */}
                    {isActive && (
                      <motion.div layoutId="activeNavIndicatorRight" className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* ── Far Right: Auth + Cart + Search ── */}
            <div className="flex items-center justify-end gap-6 shrink-0 w-[300px]">

              {/* Login */}
              {mounted && isAuthenticated ? (
                <div className="relative profile-dropdown-container">
                  <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 text-[12px] font-bold text-gray-700 hover:text-primary tracking-wide uppercase">
                    <User className="w-4 h-4 text-gray-600" />
                    {user?.name?.split(' ')[0]}
                  </button>
                  <AnimatePresence>
                    {isProfileDropdownOpen && (
                      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                        className="absolute top-full right-0 mt-3 w-44 bg-white border border-gray-100 rounded-lg shadow-xl z-50 py-1">
                        <Link href="/profile" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">My Profile</Link>
                        <Link href="/profile?tab=history" className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50">My Orders</Link>
                        <hr className="border-gray-100 my-1" />
                        <button onClick={() => useAuthStore.getState().logout()} className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-50">Log Out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => useAuthStore.getState().setAuthModalOpen(true)}
                  className="flex items-center gap-2 text-[12px] font-bold text-gray-700 hover:text-primary tracking-wide uppercase">
                  <User className="w-4 h-4 text-gray-600" />
                  LOG IN / JOIN
                </button>
              )}

              {/* Cart */}
              <button onClick={toggleCart} className="flex items-center gap-2 group">
                <div className="relative flex items-center">
                  <div className="relative w-[38px] h-[38px] bg-primary rounded-full flex items-center justify-center shadow-sm group-hover:bg-[#5b8a30] transition-colors">
                    <ShoppingBag className="w-[18px] h-[18px] text-white" />
                    {mounted && (
                      <span className="absolute -top-1 -right-1 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-primary border-2 border-white text-[10px] font-black text-white shadow-sm">
                        {itemCount}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-[13px] font-bold text-gray-600 group-hover:text-primary transition-colors">
                  ₹{mounted ? cartTotal.toLocaleString('en-IN') : '0'}
                </span>
              </button>

              {/* Search */}
              <div className="relative search-container pl-2">
                <button onClick={() => setShowSearchDropdown(!showSearchDropdown)}
                  className="text-gray-600 hover:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </button>
                <AnimatePresence>
                  {showSearchDropdown && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="absolute top-full right-0 mt-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                      <form onSubmit={handleSearch} className="flex items-center gap-2 p-3 border-b border-gray-100">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search plants, pots..." className="flex-1 text-sm focus:outline-none" autoFocus />
                        {searchQuery && <button type="button" onClick={() => setSearchQuery('')}><X className="w-4 h-4 text-gray-400" /></button>}
                      </form>
                      {isSearching && <div className="p-4 text-center text-xs text-gray-500">Searching...</div>}
                      {!isSearching && searchResults.length > 0 && (
                        <div className="max-h-[50vh] overflow-y-auto">
                          {searchResults.map((product: any) => (
                            <div key={product.id}
                              onClick={() => { router.push(`/shop/${product.id}`); setShowSearchDropdown(false); setSearchQuery('') }}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <img src={product.image_url} alt="" className="w-9 h-9 object-cover rounded-md" />
                              <div>
                                <p className="text-xs font-semibold text-gray-900 truncate max-w-[180px]">{product.title}</p>
                                <p className="text-[10px] text-primary font-bold">₹{product.price?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {!isSearching && searchQuery && searchResults.length === 0 && (
                        <div className="p-4 text-center text-xs text-gray-500">No results for "{searchQuery}"</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* ─── MOBILE ─── */}
        <div className={`flex xl:hidden w-full items-center justify-between px-4 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-white'} border-b border-gray-100`}
          style={{ height: '60px' }}>
          <Link href="/">
            <img src="/logo.png" alt="Arogyavruksham" className="h-10 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={toggleCart} className="relative w-9 h-9 bg-primary rounded-full flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-4 h-4 text-white" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-primary border-2 border-white text-[9px] font-black text-white">{itemCount}</span>
              )}
            </button>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1.5 text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* ─── MOBILE MENU DRAWER ─── */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-[100] flex xl:hidden">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="relative w-[300px] h-full bg-white flex flex-col shadow-2xl overflow-y-auto">
                {/* Drawer Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                {/* Search */}
                <form onSubmit={handleSearch} className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plants..." className="flex-1 text-sm focus:outline-none" />
                </form>
                {/* Links */}
                <nav className="flex-1 p-4 space-y-1">
                  {[...navLinks, ...navLinksRight].map(({ label, href }) => (
                    <Link key={href} href={href} onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-bold ${pathname === href ? 'bg-primary/5 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}>
                      {label}
                      <ChevronDown className="w-4 h-4 -rotate-90 text-primary" />
                    </Link>
                  ))}
                </nav>
                {/* Footer */}
                <div className="border-t border-gray-100 p-4 space-y-3">
                  {mounted && isAuthenticated ? (
                    <>
                      <Link href="/profile" className="block text-sm font-semibold text-gray-700">My Profile</Link>
                      <button onClick={() => useAuthStore.getState().logout()} className="block text-sm font-semibold text-red-500">Log Out</button>
                    </>
                  ) : (
                    <button onClick={() => { setIsMobileMenuOpen(false); useAuthStore.getState().setAuthModalOpen(true) }}
                      className="w-full bg-primary text-white text-sm font-bold py-3 rounded-lg hover:bg-primary-light transition-colors">
                      Log In / Join
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.header>

      {mounted && <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />}
    </>
  )
}
