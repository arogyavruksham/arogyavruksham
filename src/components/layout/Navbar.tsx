'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, User, Search, ChevronDown, X, LogOut, LayoutDashboard, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { AddressModal } from './AddressModal'
import { usePathname, useRouter } from 'next/navigation'

export function Navbar() {
  const pathname = usePathname()
  const { items, toggleCart } = useCartStore()
  const { user, isAuthenticated } = useAuthStore()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => {
    setIsScrolled(y > 10)
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
      setSearchResults(data || [])
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
  }, [])

  if (pathname?.startsWith('/admin')) return null

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 w-full flex-col ${pathname === '/checkout' ? 'hidden md:flex' : 'flex'} transition-all duration-300 ${isScrolled ? 'shadow-md bg-white' : 'bg-white/95 backdrop-blur-sm'} border-b border-gray-100`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full max-w-[1400px]">
        {/* Mobile Header */}
        <div className="flex xl:hidden items-center justify-between w-full h-16 relative">
          <Link href="/" className="flex items-center">
            <img src="/logo.svg" alt="Arogyavruksham" className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-700 bg-gray-50 rounded-full" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button onClick={toggleCart} className="p-2 text-gray-700 bg-gray-50 rounded-full relative">
              <ShoppingBag className="w-5 h-5" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Header (from screenshot) */}
        <div className="hidden xl:flex items-center justify-between w-full h-20 relative">
          
          {/* Left Block (Settings & Contact) */}
          <div className="flex items-center gap-6 text-sm font-semibold text-gray-700 flex-1">
            <div className="flex items-center gap-1 cursor-pointer hover:text-primary transition-colors">
              USD | EN
            </div>
            <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
              <span className="text-primary text-base">📞</span> 034 2333 3444
            </div>
          </div>

          {/* Left Navigation Links */}
          <div className="flex items-center gap-8 text-sm font-bold tracking-wide pr-12">
            <Link href="/" className="flex items-center gap-1 text-primary transition-colors uppercase">
              Home <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Link href="/shop" className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-gray-800">
              Shop <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Link href="/portfolio" className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-gray-800">
              Portfolio <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>

          {/* Centered Large Logo (Breakout) */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center justify-center mt-3" style={{ width: '160px' }}>
            <Link href="/">
              <motion.img 
                whileHover={{ scale: 1.05 }}
                src="/logo.svg" 
                alt="Arogyavruksham" 
                className="w-full h-auto drop-shadow-md" 
              />
            </Link>
          </div>

          {/* Right Navigation Links */}
          <div className="flex items-center gap-8 text-sm font-bold tracking-wide pl-12">
            <Link href="/blogs" className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-gray-800">
              Blogs <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Link href="/features" className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-gray-800">
              Features <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
            <Link href="/pages" className="flex items-center gap-1 hover:text-primary transition-colors uppercase text-gray-800">
              Pages <ChevronDown className="w-3.5 h-3.5 text-primary" />
            </Link>
          </div>

          {/* Right Block (Auth & Cart & Search) */}
          <div className="flex items-center gap-6 justify-end flex-1">
            
            {mounted && isAuthenticated ? (
              <div className="relative profile-dropdown-container">
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-primary uppercase">
                  <User className="w-4 h-4 text-primary" /> {user?.name?.split(' ')[0]}
                </button>
                {isProfileDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded shadow-lg border border-gray-100 z-50 py-2">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <button onClick={() => { setIsProfileDropdownOpen(false); useAuthStore.getState().logout() }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Log Out</button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => useAuthStore.getState().setAuthModalOpen(true)} className="flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-primary uppercase">
                <User className="w-4 h-4 text-gray-800" /> Log In / Join
              </button>
            )}

            <button onClick={toggleCart} className="flex items-center gap-2 text-gray-800 hover:text-primary">
              <div className="relative flex items-center">
                <ShoppingBag className="w-5 h-5" />
                {mounted && (
                  <span className="absolute -top-1.5 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#689f38] text-[10px] font-bold text-white border-2 border-white">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="text-sm font-bold ml-1">$0.00</span>
            </button>

            <div className="relative search-container">
              <button onClick={() => setShowSearchDropdown(!showSearchDropdown)} className="text-gray-800 hover:text-primary">
                <Search className="w-5 h-5" />
              </button>
              <AnimatePresence>
                {showSearchDropdown && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-white rounded shadow-xl border border-gray-100 overflow-hidden z-50">
                    <form onSubmit={handleSearch} className="flex border-b border-gray-100">
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full text-sm px-4 py-3 focus:outline-none" autoFocus />
                      <button type="submit" className="px-4 text-gray-400 hover:text-primary"><Search className="w-4 h-4" /></button>
                    </form>
                    {isSearching ? (
                      <div className="p-3 text-center text-xs text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 && (
                      <div className="max-h-[50vh] overflow-y-auto">
                        {searchResults.map((product) => (
                          <div key={product.id} onClick={() => { router.push(`/shop/${product.id}`); setShowSearchDropdown(false); setSearchQuery('') }} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer">
                            <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                            <div className="flex flex-col"><span className="text-xs font-semibold">{product.title}</span><span className="text-[10px] text-gray-500">${product.price}</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[100] flex xl:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} className="relative w-[280px] h-full bg-white flex flex-col shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <img src="/logo.svg" className="h-8" />
                <button onClick={() => setIsMobileMenuOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-4 space-y-4">
                <Link href="/" className="block font-bold">Home</Link>
                <Link href="/shop" className="block font-bold">Shop</Link>
                <Link href="/portfolio" className="block font-bold">Portfolio</Link>
                <Link href="/blogs" className="block font-bold">Blogs</Link>
                <Link href="/features" className="block font-bold">Features</Link>
                <Link href="/pages" className="block font-bold">Pages</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
