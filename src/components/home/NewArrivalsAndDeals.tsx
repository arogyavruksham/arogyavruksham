'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Heart, Plus, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

const TABS = ['All', 'Office Plant', 'Indoor Plant']

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' as const }
  })
}

function MobileProductCard({ product, index }: { product: any; index: number }) {
  const [liked, setLiked] = useState(false)
  const { addItem } = useCartStore()

  return (
    <div className="bg-white rounded-3xl p-4 relative flex flex-col justify-between shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-shadow border border-[#F4F6F4]">
      {/* Top row badges */}
      <div className="flex items-center justify-between z-10 w-full mb-1">
        <span className={`text-[9px] font-extrabold px-3 py-1 rounded-full tracking-wider ${product.original_price ? 'bg-[#D27D56] text-white' : 'bg-[#1E4631]/10 text-[#1E4631]'}`}>
          {product.original_price ? 'SALE' : 'NEW'}
        </span>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }} 
          className="w-8 h-8 rounded-full bg-[#F4F6F4] flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/shop/${product.id}`} className="flex flex-col items-center my-3 group">
        <div className="w-full h-[140px] flex items-center justify-center rounded-2xl bg-[#FAFAF7] p-2 overflow-hidden">
          <img 
            src={product.image_url} 
            alt={product.title} 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="h-full w-full object-contain mix-blend-multiply origin-bottom group-hover:scale-110 transition-transform duration-500" 
          />
        </div>
      </Link>

      {/* Info & Cart Add Button */}
      <div className="mt-1">
        <Link href={`/shop/${product.id}`}>
          <h4 className="text-[15px] font-bold text-[#1a1a1a] leading-tight truncate font-sans">{product.title}</h4>
          <p className="text-[12px] text-gray-500 font-medium capitalize mt-1">{product.category || 'Indoor Succulent'}</p>
        </Link>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F4F6F4]">
          <div className="flex flex-col leading-tight">
            {product.original_price && <span className="text-[11px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
            <span className="text-[16px] font-black text-[#1E4631]">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); addItem(product); }} 
            className="w-9 h-9 rounded-full bg-[#1E4631] text-white flex items-center justify-center hover:bg-[#153424] active:scale-90 transition-transform shadow-md"
            aria-label="Add to cart"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductMiniCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const { addItem } = useCartStore()

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="h-full">
      <div className="group flex flex-col h-full bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10 w-full mb-3">
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase ${product.original_price ? 'bg-[#D27D56] text-white shadow-sm' : 'bg-[#F4F6F4] text-[#1E4631]'}`}>
            {product.original_price ? 'Sale' : 'New'}
          </span>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }} 
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Image Box */}
        <Link href={`/shop/${product.id}`} className="relative bg-[#FAFAF7] rounded-2xl aspect-[4/5] flex items-center justify-center p-6 mb-5 overflow-hidden transition-all duration-300">
          <motion.img 
            src={product.image_url} 
            alt={product.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply origin-bottom"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </Link>

        {/* Info & Cart Add */}
        <div className="flex-1 flex flex-col justify-end">
          <Link href={`/shop/${product.id}`}>
            <p className="text-[12px] text-gray-500 font-medium capitalize mb-1">{product.category || 'Indoor Plant'}</p>
            <h4 className="text-[16px] font-bold text-[#222] mb-3 leading-tight group-hover:text-[#1E4631] transition-colors">{product.title}</h4>
          </Link>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            <div className="flex flex-col">
              {product.original_price && <span className="text-[12px] text-gray-400 line-through leading-none mb-1">₹{product.original_price.toLocaleString('en-IN')}</span>}
              <span className="text-[16px] font-black text-[#1E4631] leading-none">₹{product.price.toLocaleString('en-IN')}</span>
            </div>
            
            <button 
              onClick={(e) => { e.preventDefault(); addItem(product); }} 
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${hovered ? 'bg-[#1E4631] text-white shadow-lg' : 'bg-[#F4F6F4] text-[#1E4631]'}`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function NewArrivalsAndDeals() {
  const [activeTab, setActiveTab] = useState('All')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [dealProduct, setDealProduct] = useState<any>(null)
  const [dealIndex, setDealIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12)
      if (data) {
        const normalized = normalizeProducts(data)
        setAllProducts(normalized)
        setDealProduct(normalized[0] || null)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filtered = activeTab === 'All' ? allProducts : 
                   activeTab === 'Indoor Plant' ? allProducts.filter(p => p.category?.toLowerCase().includes('indoor')) :
                   activeTab === 'Office Plant' ? allProducts.filter(p => p.category?.toLowerCase().includes('office') || p.category?.toLowerCase().includes('succulent')) :
                   allProducts
                   
  const displayProducts = filtered.slice(0, 8)

  const prevDeal = () => {
    const idx = (dealIndex - 1 + allProducts.length) % allProducts.length
    setDealIndex(idx)
    setDealProduct(allProducts[idx])
  }
  const nextDeal = () => {
    const idx = (dealIndex + 1) % allProducts.length
    setDealIndex(idx)
    setDealProduct(allProducts[idx])
  }

  return (
    <>
      {/* ─── MOBILE VIEW ONLY ─── */}
      <section className="block md:hidden bg-[#FAFAF7] py-10 px-5">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-[28px] font-medium text-[#1E4631] tracking-tight">New Arrivals</h2>
          <Link href="/shop" className="text-[11px] font-bold text-[#D27D56] uppercase tracking-[0.15em] flex items-center">
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#1E4631]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {allProducts.slice(0, 6).map((product, i) => (
              <MobileProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ─── DESKTOP VIEW — Top Rating ─── */}
      <section ref={ref} className="hidden md:block py-24 bg-[#FAFAF7] overflow-hidden">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          {/* Header with Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none">
              Top Rating
            </h2>

            <div className="flex gap-8">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[14px] font-semibold tracking-wide whitespace-nowrap transition-all duration-300 pb-2 border-b-2 ${
                    activeTab === tab
                      ? 'border-[#1E4631] text-[#1E4631]'
                      : 'border-transparent text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E4631]" />
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">
              No plants in this category yet.
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {displayProducts.map((product, i) => (
                  <ProductMiniCard
                    key={product.id}
                    product={product}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  )
}
