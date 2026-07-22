'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, User, Search, MapPin, ChevronDown, X, LogOut, LayoutDashboard, ChevronLeft, Heart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
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
  const router = useRouter()
  
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.profile-dropdown-container')) {
        setIsProfileDropdownOpen(false);
      }
      if (!target.closest('.search-container')) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        setShowSearchDropdown(false)
        return
      }

      setIsSearching(true)
      setShowSearchDropdown(true)
      
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${searchQuery.trim()}%,category.ilike.%${searchQuery.trim()}%,description.ilike.%${searchQuery.trim()}%`)
        .limit(5)
        
      setSearchResults(normalizeProducts(data || []))
      setIsSearching(false)
    }

    const timeoutId = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  useEffect(() => {
    setMounted(true)
    
    // Check if profile photo exists in local storage
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
    
    // Listen for storage changes in case it's updated in another tab/page
    const handleStorageChange = () => {
      const updatedPhoto = localStorage.getItem('profilePhoto')
      setProfilePhoto(updatedPhoto)
    }
    window.addEventListener('storage', handleStorageChange)
    
    async function fetchDefaultCity() {
      if (isAuthenticated) {
        try {
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            const { data } = await supabase
              .from('user_addresses')
              .select('city')
              .eq('user_id', user.id)
              .eq('is_default', true)
              .maybeSingle()
            
            if (data && data.city) {
              setDefaultCity(data.city)
            } else {
               const { data: first } = await supabase
                 .from('user_addresses')
                 .select('city')
                 .eq('user_id', user.id)
                 .limit(1)
                 .maybeSingle()
               if (first && first.city) setDefaultCity(first.city)
               else setDefaultCity(null)
            }
          }
        } catch (error) {
          console.error("Error fetching city:", error)
        }
      } else {
        setDefaultCity(null)
      }
    }
    
    fetchDefaultCity()
    
    window.addEventListener('addressUpdated', fetchDefaultCity)
    window.addEventListener('addressUpdated', fetchDefaultCity)
    return () => window.removeEventListener('addressUpdated', fetchDefaultCity)
  }, [isAuthenticated])
  
  if (pathname?.startsWith('/admin')) {
    return null
  }
  
  return (
    <header className={`sticky top-0 z-50 w-full flex-col bg-white ${pathname === '/checkout' ? 'hidden md:flex' : 'flex'}`}>
      {/* Main Navbar */}
      <div className="w-full border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mobile Layout (Visible only on md:hidden) */}
            <div className="flex md:hidden items-center justify-between w-full h-16 pt-2 relative">
              {/* Left: Brand Name */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <img src="/logo.png" alt="Arogyavruksham Silks" className="max-h-20 max-w-[200px] sm:max-w-[260px] scale-110 sm:scale-125 origin-left object-contain" />
                </Link>
              </div>

              {/* Right: Search & Profile */}
              <div className="flex items-center gap-2">
                <button 
                  className="p-2 flex items-center justify-center text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors" 
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Search className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push('/profile')
                    } else {
                      useAuthStore.getState().setAuthModalOpen(true)
                    }
                  }}
                  className="p-2 flex items-center justify-center text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors relative"
                >
                  {mounted && isAuthenticated && profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  {/* Notification Dot */}
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border border-white"></span>
                </button>
              </div>
            </div>

            {/* Desktop & Tablet Layout (Visible only on md:flex) */}
            <div className="hidden md:flex items-center justify-between w-full h-20 gap-4 lg:gap-6 relative">
              
              {/* Tablet Left Actions (Visible only on Tablet) */}
              <div className="flex lg:hidden items-center gap-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <Menu className="w-5 h-5" />
                </button>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-gray-700 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>

              {/* Logo */}
              <div className="flex items-center shrink-0 lg:static absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 lg:translate-x-0 lg:translate-y-0 z-10">
                <Link href="/" className="flex items-center gap-2">
                  <img src="/logo.png" alt="Arogyavruksham Silks" className="max-h-12 lg:max-h-28 max-w-[180px] lg:max-w-[340px] scale-100 lg:scale-[1.3] origin-center lg:origin-left object-contain py-1" />
                </Link>
              </div>
              
              {/* Minimal Search Bar (Visible only on Desktop) */}
              <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-md relative mx-4 search-container">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true) }}
                  placeholder="Search for plants, styles..." 
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                />
                <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-light transition-colors">
                  <Search className="w-4 h-4" />
                </button>

                {/* Search Dropdown */}
                {showSearchDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[60vh] overflow-y-auto py-2">
                        {searchResults.map((product) => (
                          <div 
                            key={product.id}
                            onClick={() => {
                              router.push(`/shop/${product.id}`)
                              setShowSearchDropdown(false)
                              setSearchQuery('')
                            }}
                            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded-md border border-gray-100" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-sm font-semibold text-gray-900 truncate">{product.title}</span>
                              <span className="text-xs text-gray-500">{product.category} • ₹{product.price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-gray-100 mt-2">
                          <button 
                            type="button"
                            onClick={() => handleSearch()}
                            className="w-full py-3 text-sm font-semibold text-[#1A73E8] hover:bg-gray-50 transition-colors"
                          >
                            View all results for "{searchQuery}"
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
                    )}
                  </div>
                )}
              </form>

              {/* Right Actions */}
              <div className="flex items-center gap-6 shrink-0">
                
                {/* Location */}
                <div 
                  className="hidden lg:flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setIsAddressModalOpen(true)}
                >
                  <MapPin className="w-5 h-5 text-gray-500" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs text-gray-500">Delivering to</span>
                    <span className="font-semibold text-gray-900">{mounted && defaultCity ? defaultCity : 'Select Address'}</span>
                  </div>
                </div>

                {/* Country/Currency */}
                <div className="flex items-center gap-1.5 text-sm font-medium cursor-pointer border-l pl-6 border-gray-200 hover:text-primary transition-colors">
                  <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-5 h-3.5 rounded-sm object-cover border border-gray-200" />
                  <span>IN | ₹</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {/* Cart */}
                <button 
                  id="nav-cart-icon"
                  className="flex items-center gap-2 text-foreground hover:text-primary transition-colors relative border-l pl-6 border-gray-200" 
                  aria-label="Cart"
                  onClick={toggleCart}
                >
                  <div className="relative">
                    <ShoppingBag className="w-6 h-6" />
                    {mounted && itemCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#1A73E8] text-[10px] font-bold text-white shadow-sm">
                        {itemCount}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold">Cart</span>
                </button>

                {/* Account */}
                {mounted && isAuthenticated ? (
                  <div className="relative profile-dropdown-container border-l pl-6 border-gray-200">
                    <button 
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center gap-2 text-foreground hover:text-primary transition-colors focus:outline-none" 
                      aria-label="Account"
                    >
                      <div className="w-8 h-8 bg-[#1A73E8] text-white rounded-full flex items-center justify-center overflow-hidden border border-blue-200 shrink-0 font-bold text-sm shadow-sm">
                        {profilePhoto ? (
                          <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'
                        )}
                      </div>
                      <div className="flex flex-col leading-tight text-left">
                        <span className="text-xs text-gray-500">Welcome</span>
                        <span className="text-sm font-semibold">{user?.name.split(' ')[0]}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute top-full right-0 mt-4 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                          <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <div className="p-2 space-y-1">
                          <Link 
                            href="/profile?tab=dashboard" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-gray-400" />
                            Dashboard
                          </Link>
                          <Link 
                            href="/profile?tab=history" 
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            My Orders
                          </Link>
                        </div>
                        <div className="p-2 border-t border-gray-100">
                          <button 
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              useAuthStore.getState().logout();
                            }}
                            className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => useAuthStore.getState().setAuthModalOpen(true)} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors border-l pl-6 border-gray-200" aria-label="Account">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div className="flex flex-col leading-tight text-left">
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
      <div className="hidden md:block w-full bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 overflow-x-auto scrollbar-hide h-12 text-sm font-medium text-gray-600 whitespace-nowrap">
            <Link href="/shop" className="flex items-center gap-2 font-bold text-gray-900 hover:text-[#51D3B7] transition-colors shrink-0">
              <Menu className="w-4 h-4 text-[#51D3B7]" /> All Categories
            </Link>
            
            {categories.map((cat, idx) => (
              <Link 
                key={idx} 
                href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`} 
                className="hover:text-[#51D3B7] transition-colors font-semibold text-gray-700 shrink-0"
              >
                {cat.name}
              </Link>
            ))}
            
            <div className="ml-auto flex items-center gap-4 shrink-0 pl-4">
              <Link href="/shop?sale=true" className="flex items-center gap-1 text-[#FF6B35] font-bold hover:text-[#e55a2b] transition-colors">
                 Best Deals
              </Link>
            </div>
          </nav>
        </div>
      </div>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Full Screen Search Overlay */}
          <div className="relative w-full h-full bg-gray-50 flex flex-col animate-in slide-in-from-bottom-2">
            {/* Header: Back & Search */}
            <div className="flex items-center gap-3 p-4 bg-white border-b border-gray-100 pb-safe-top">
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="relative flex items-center w-full bg-white border border-[#FF6B35] rounded-full px-4 py-2">
                  <Search className="w-5 h-5 text-gray-400 mr-2 shrink-0" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.trim()) setShowSearchDropdown(true) }}
                    placeholder="Search" 
                    className="w-full bg-transparent text-sm focus:outline-none text-[#1A1F36]"
                    autoFocus
                  />
                </div>
              </form>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {/* Dropdown Results */}
              {showSearchDropdown && searchQuery.trim() && (
                <div className="bg-white border-b border-gray-100">
                  {isSearching ? (
                    <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((product) => (
                        <div 
                          key={product.id}
                          onClick={() => {
                            router.push(`/shop/${product.id}`)
                            setIsMobileMenuOpen(false)
                            setShowSearchDropdown(false)
                            setSearchQuery('')
                          }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50"
                        >
                          <Search className="w-4 h-4 text-gray-300" />
                          <span className="text-sm text-gray-700">{product.title}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">No results found for "{searchQuery}"</div>
                  )}
                </div>
              )}

              {/* Default State (when not searching or empty query) */}
              {!searchQuery.trim() && (
                <div className="p-4 space-y-8">
                  
                  {/* Categories Row */}
                  <div>
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                      {categories.map((cat, i) => (
                        <Link 
                          key={i} 
                          href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex flex-col items-center gap-2 shrink-0 w-16"
                        >
                          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#51D3B7]/30 bg-gray-100 flex items-center justify-center">
                            {cat.image ? (
                              <img src={cat.image} alt="" className="w-full h-full object-cover object-top" />
                            ) : (
                              <span className="text-xs font-bold text-gray-700">{cat.name.slice(0, 3)}</span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-800 text-center truncate w-full">{cat.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Top Searches */}
                  <div>
                    <h3 className="font-sans font-bold text-[#1A1F36] mb-3">Top Searches</h3>
                    <div className="flex flex-wrap gap-2">
                      {['Pure Silk', 'Banarasi', 'Cotton Plants', 'Bridal Collection', 'Red Plant', 'Party Wear'].map((term, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            setSearchQuery(term);
                            handleSearch();
                          }}
                          className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Best Selling */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-sans font-bold text-[#1A1F36]">Best Selling</h3>
                      <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="text-xs text-[#FF6B35] font-medium">See All</Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Fake data for best selling UI to match mockup */}
                      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center relative">
                        <Heart className="w-4 h-4 text-gray-400 absolute top-2 right-2" />
                        <img src="https://images.unsplash.com/photo-1583391733958-693b3f29b809?w=200" alt="Plant" className="w-full aspect-square object-cover rounded-lg mb-2 mix-blend-multiply" />
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm flex flex-col items-center relative">
                        <Heart className="w-4 h-4 text-gray-400 absolute top-2 right-2" />
                        <img src="https://images.unsplash.com/photo-1610189013233-6e273ffcb638?w=200" alt="Plant" className="w-full aspect-square object-cover rounded-lg mb-2 mix-blend-multiply" />
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Address Modal */}
      {mounted && <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />}
    </header>
  )
}
