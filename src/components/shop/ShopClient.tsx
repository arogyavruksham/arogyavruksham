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
      {/* ─── Minimalist Search & Filter Top Bar ─── */}
      <div className="border-b border-gray-200 pb-6 mb-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          
          {/* Instant Search Bar */}
          <div className="relative flex-1 group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gray-800 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical items..."
              className="w-full pl-8 pr-10 py-3 bg-transparent border-none focus:ring-0 text-[16px] md:text-[18px] font-medium text-gray-800 placeholder-gray-400 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 pl-4 md:pl-6">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.15em]">Sort</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent border-none text-[13px] font-semibold text-gray-800 focus:ring-0 cursor-pointer outline-none hover:text-black transition-colors p-0"
            >
              <option value="new">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory.toLowerCase() === cat.toLowerCase()
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isActive && cat !== 'All' ? 'All' : cat)}
                className={`relative py-2 text-[12px] font-semibold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  isActive ? 'text-black' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {cat}
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-black"
                    initial={false}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Results Status ─── */}
      <div className="flex items-center justify-between pb-4 text-[12px] uppercase tracking-widest font-semibold text-gray-400">
        <span>
          <strong className="text-black">{filteredProducts.length}</strong> items
          {searchQuery ? ` matching "${searchQuery}"` : ''}
          {selectedCategory !== 'All' ? ` / ${selectedCategory}` : ''}
        </span>
        {(searchQuery || selectedCategory !== 'All') && (
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
            className="text-black hover:text-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-32">
          <h3 className="font-serif text-3xl text-gray-300 mb-4">No botanical items found</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Try adjusting your search or filter to find what you're looking for.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
            className="border border-black text-black px-8 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            View All Collection
          </button>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-16"
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
