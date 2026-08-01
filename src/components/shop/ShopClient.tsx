'use client'

import { useState, useMemo } from 'react'
import { ProductCard } from '@/components/shop/ProductCard'
import { Search, X, SlidersHorizontal, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  title: string
  price: number
  original_price?: number
  category?: string
  image_url?: string
  stock_count?: number
  description?: string
}

const CATEGORIES = ['All', 'Indoor Plants', 'Succulents', 'Office Plants', 'Pots', 'Seeds', 'Gift Bundles']

export function ShopClient({
  initialProducts,
  initialCategory = '',
  initialQuery = ''
}: {
  initialProducts: Product[]
  initialCategory?: string
  initialQuery?: string
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery || '')
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'All')
  const [sortBy, setSortBy] = useState<'new' | 'price-asc' | 'price-desc'>('new')

  // Ultra-responsive instant client-side filtering
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(p => {
      // 1. Category Filter
      let matchesCat = true
      if (selectedCategory && selectedCategory !== 'All') {
        const cat = selectedCategory.toLowerCase()
        const pCat = (p.category || '').toLowerCase()
        const pTitle = (p.title || '').toLowerCase()
        matchesCat = pCat.includes(cat) || cat.includes(pCat) || 
          (cat === 'indoor plants' && (pCat.includes('indoor') || pTitle.includes('indoor'))) ||
          (cat === 'succulents' && (pCat.includes('succulent') || pTitle.includes('succulent') || pTitle.includes('cactus') || pTitle.includes('snake'))) ||
          (cat === 'pots' && (pCat.includes('pot') || pTitle.includes('pot') || pTitle.includes('planter')))
      }

      // 2. Search Text matching (matches any substring or words in title, category, or description)
      let matchesQuery = true
      if (searchQuery.trim()) {
        const queryTokens = searchQuery.trim().toLowerCase().split(/\s+/)
        const targetText = `${p.title || ''} ${p.category || ''} ${p.description || ''}`.toLowerCase()
        
        // Ensure every search term token matches somewhere in the product text (e.g. typing 'sna' matches 'snake')
        matchesQuery = queryTokens.every(token => targetText.includes(token))
      }

      return matchesCat && matchesQuery
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0)
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0)
      return 0 // Default order
    })
  }, [initialProducts, selectedCategory, searchQuery, sortBy])

  return (
    <div className="space-y-8">
      {/* ─── Search & Filter Top Bar ─── */}
      <div className="bg-[#FCFBF8] border border-gray-200/80 rounded-[28px] p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#235839]/60 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by plant name (e.g. Snake Plant, Peace Lily, Pots)..."
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-white border border-gray-200 focus:border-[#235839] focus:ring-2 focus:ring-[#235839]/20 text-[14px] font-medium text-gray-800 transition-all outline-none shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#235839]" />
            <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-[13px] font-semibold text-gray-800 focus:outline-none focus:border-[#235839] cursor-pointer"
            >
              <option value="new">Featured & Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide pt-1 border-t border-gray-200/50">
          <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive && cat !== 'All' ? 'All' : cat)}
                className={`px-4 py-1.5 rounded-full text-[12px] font-bold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-[#235839] text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Results Status & Grid ─── */}
      <div className="flex items-center justify-between px-2 text-[13px] font-semibold text-gray-500">
        <span>
          Showing <strong className="text-[#1E4631] font-extrabold">{filteredProducts.length}</strong> botanical items
          {searchQuery ? ` matching "${searchQuery}"` : ''}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        </span>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
            className="text-[#235839] hover:underline text-[12px] font-extrabold flex items-center gap-1"
          >
            Reset Filters
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#FCFBF8] rounded-[28px] border border-gray-200/60 font-sans p-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">No plants matched your criteria</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            We couldn't find any items matching "{searchQuery}". Try using broader terms or clearing your search filters.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
            className="bg-[#235839] text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-[#1A432B] transition-colors"
          >
            View All Plants
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8"
          >
            {filteredProducts.map((product) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                <ProductCard
                  id={product.id}
                  title={product.title || 'Botanical Specimen'}
                  price={product.price || 0}
                  original_price={product.original_price}
                  category={product.category || 'Indoor Plants'}
                  imageUrl={product.image_url || ''}
                  stock_count={product.stock_count || 10}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
