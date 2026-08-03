'use client'

import Link from 'next/link'
import { ShoppingBag, Search, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export function MobileHomeHeader() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const { toggleCart, items } = useCartStore()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Live Search debouncing
  useEffect(() => {
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    const fetchSearchResults = async () => {
      setIsSearching(true)
      setShowSearchDropdown(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(10)
      setSearchResults(data || [])
      setIsSearching(false)
    }
    const id = setTimeout(fetchSearchResults, 200)
    return () => clearTimeout(id)
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setShowSearchDropdown(false)
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  return (
    <div className="w-full relative z-30 pb-4">
      {/* ─── INLINE MOBILE HOMEPAGE HEADER (NOT FIXED) ─── */}
      <div className="flex w-full items-center justify-between gap-2.5">
        {/* Top Left Logo Corner Box */}
        <Link href="/" className="flex items-center justify-center shrink-0 w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-2xl bg-white border border-gray-100 shadow-xs p-0.5 active:scale-95 transition-transform overflow-hidden">
          <img 
            src="/logo.png" 
            alt="Arogyavruksham Logo" 
            className="w-full h-full object-contain scale-125 mix-blend-multiply transition-transform duration-200" 
          />
        </Link>

        {/* Inline Search Bar */}
        <div className="flex-1 min-w-0 relative">
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full bg-white border border-gray-200/90 rounded-2xl px-3 py-2.5 shadow-inner focus-within:border-[#235839] focus-within:ring-2 focus-within:ring-[#235839]/10 transition-all">
            <Search className="w-4 h-4 text-[#235839]/70 shrink-0 stroke-[2.4]" />
            <input 
              type="text" 
              value={searchQuery} 
              onChange={(e) => {
                setSearchQuery(e.target.value)
                if (e.target.value.trim()) setShowSearchDropdown(true)
              }}
              onFocus={() => {
                if (searchQuery.trim() || searchResults.length > 0) setShowSearchDropdown(true)
              }}
              placeholder="Search plants, succulents..." 
              className="w-full text-xs font-semibold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400 truncate" 
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false) }}
                className="p-0.5 rounded-full hover:bg-gray-100 text-gray-400 shrink-0"
                aria-label="Clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {/* Cart Icon Button */}
        <button onClick={toggleCart} className="relative w-[52px] h-[52px] sm:w-[56px] sm:h-[56px] rounded-2xl border border-gray-200/80 bg-white shadow-xs text-gray-700 flex items-center justify-center shrink-0 active:scale-95 transition-all">
          <ShoppingBag className="w-5 h-5 stroke-[2]" />
          {mounted && itemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[10px] font-bold text-white shadow-xs">
              {itemCount}
            </span>
          )}
        </button>
      </div>

      {/* Live Search Results Dropdown */}
      <AnimatePresence>
        {showSearchDropdown && (searchQuery.trim().length > 0 || isSearching) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-2 w-full bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-2xl overflow-hidden max-h-[70vh] overflow-y-auto z-50">
            {isSearching && <div className="p-4 text-center text-xs text-gray-500 font-medium">Searching our greenhouse...</div>}
            {!isSearching && searchResults.length > 0 && (
              <div className="divide-y divide-gray-100">
                {searchResults.map((product: any) => (
                  <div key={product.id}
                    onClick={() => { router.push(`/shop/${product.id}`); setShowSearchDropdown(false); setSearchQuery('') }}
                    className="flex items-center gap-3.5 py-2.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer">
                    <div className="w-11 h-11 rounded-xl bg-[#F7F6F2] border border-gray-200/50 p-1 flex items-center justify-center shrink-0">
                      <img src={product.image_url} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-gray-900 truncate">{product.title}</p>
                      <p className="text-[11px] text-[#235839] font-extrabold mt-0.5">₹{product.price?.toLocaleString('en-IN')} <span className="text-gray-400 font-normal text-[10px] ml-1.5 capitalize">{product.category || 'Indoor'}</span></p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleSearch}
                  className="w-full py-2.5 mt-2 text-center bg-[#EBE7DE] hover:bg-[#DDD5C6] text-[#1E4631] font-bold text-xs rounded-xl transition-colors block"
                >
                  View all results for "{searchQuery}" &rarr;
                </button>
              </div>
            )}
            {!isSearching && searchQuery && searchResults.length === 0 && (
              <div className="p-6 text-center text-xs text-gray-500 font-medium">No botanical matches for "{searchQuery}"</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
