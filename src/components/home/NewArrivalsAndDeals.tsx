'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Heart, Plus } from 'lucide-react'
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
    <div className="bg-[#F7F6F2] rounded-[24px] p-3.5 border border-gray-200/60 relative flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
      {/* Top row badges */}
      <div className="flex items-center justify-between z-10 w-full mb-1">
        <span className="bg-white/90 backdrop-blur-xs text-gray-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
          {product.original_price ? 'SALE' : 'NEW'}
        </span>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }} 
          className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 shadow-2xs transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/shop/${product.id}`} className="flex flex-col items-center my-2">
        <div className="w-full h-[130px] flex items-center justify-center">
          <img 
            src={product.image_url} 
            alt={product.title} 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="h-full w-full object-contain mix-blend-multiply origin-bottom" 
          />
        </div>
      </Link>

      {/* Info & Cart Add Button */}
      <div className="mt-2">
        <Link href={`/shop/${product.id}`}>
          <h4 className="text-[14px] font-bold text-gray-900 leading-tight truncate">{product.title}</h4>
          <p className="text-[11px] text-gray-500 font-medium capitalize mt-0.5">{product.category || 'Indoor Succulent'}</p>
        </Link>
        <div className="flex items-center justify-between mt-3 pt-1 border-t border-gray-200/50">
          <div className="flex flex-col">
            {product.original_price && <span className="text-[10px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
            <span className="text-[14px] font-black text-[#1E4631]">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); addItem(product); }} 
            className="w-8 h-8 rounded-full bg-[#235839] hover:bg-[#1A432B] text-white flex items-center justify-center shadow-sm active:scale-90 transition-transform"
            aria-label="Add to cart"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductMiniCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="h-full">
      <Link href={`/shop/${product.id}`} className="group flex flex-col h-full">
        {/* Image Box */}
        <div className="relative bg-[#f9f9fb] aspect-[4/5] flex items-center justify-center p-6 mb-4 overflow-hidden transition-all duration-300">
          {/* Badge */}
          {product.original_price && (
            <span className="absolute top-4 left-4 z-10 bg-[#ffb156] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">SALE</span>
          )}
          {index === 1 && !product.original_price && (
            <span className="absolute top-4 left-4 z-10 bg-[#ff6b6b] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">HOT</span>
          )}

          <motion.img 
            src={product.image_url} 
            alt={product.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply origin-bottom"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Info */}
        <div className="text-center px-2 flex-1 flex flex-col justify-end">
          <h4 className="text-[14px] font-bold text-[#222] mb-1 leading-tight group-hover:text-[#689f38] transition-colors">{product.title}</h4>
          <div className="flex items-center justify-center gap-2">
            {product.original_price && <span className="text-[13px] text-[#999] line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
            <span className="text-[13px] font-bold text-[#689f38]">₹{product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>
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
                   activeTab === 'Office Plant' ? allProducts.filter(p => p.category?.toLowerCase().includes('indoor') || p.category?.toLowerCase().includes('succulent')) :
                   allProducts
                   
  const displayProducts = filtered.slice(0, 6)

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
      {/* ─── MOBILE VIEW ONLY (New Arrivals Grid matching preview) ─── */}
      <section className="block md:hidden bg-[#FCFBF8] py-6 px-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-[24px] font-bold text-[#1E4631] tracking-tight">New Arrivals</h2>
          <Link href="/shop" className="text-[12px] font-extrabold text-[#235839] uppercase tracking-wider hover:underline">
            VIEW ALL
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#235839]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {allProducts.slice(0, 6).map((product, i) => (
              <MobileProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ─── DESKTOP VIEW ─── */}
      <section ref={ref} className="hidden md:block py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">

            {/* Left: New Arrivals */}
            <div className="flex-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
                className="mb-8 border-b border-[#f0f0f0] flex flex-col md:flex-row md:items-end md:justify-between pb-3 gap-4">
                <h2 className="font-serif text-[28px] md:text-[32px] text-[#333] font-normal leading-none">New Arrivals</h2>
                
                {/* Tabs inline next to header on desktop */}
                <div className="flex gap-8 overflow-x-auto scrollbar-hide">
                  {TABS.map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-[14px] font-medium whitespace-nowrap shrink-0 border-b-[2px] transition-all duration-300 relative top-[4px] ${activeTab === tab ? 'border-[#689f38] text-[#333]' : 'border-transparent text-[#999] hover:text-[#666]'}`}>
                      {tab}
                    </button>
                  ))}
                </div>
              </motion.div>

              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#689f38]" /></div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-20 text-[#999] text-sm">No plants in this category yet.</div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-6 gap-y-12">
                    {displayProducts.map((product, i) => (
                      <ProductMiniCard key={product.id} product={product} index={i} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Right: Deal of the Day */}
            <div className="w-full lg:w-[450px] shrink-0">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center justify-between mb-8 border-b border-[#f0f0f0] pb-3">
                <h2 className="font-serif text-[28px] md:text-[32px] text-[#333] font-normal leading-none">Deals Of The Day</h2>
                <div className="flex gap-3">
                  <button onClick={prevDeal} className="text-[#999] hover:text-[#333] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                  <button onClick={nextDeal} className="text-[#999] hover:text-[#333] transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </motion.div>

              <AnimatePresence mode="wait">
                {dealProduct && (
                  <motion.div key={dealProduct.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }}
                    className="bg-[#f9f9fb] w-full aspect-[4/5] flex flex-col justify-center items-center p-8 group relative overflow-hidden">
                    
                    <div className="flex-1 w-full flex items-center justify-center p-4">
                      <img 
                        src={dealProduct.image_url} 
                        alt={dealProduct.title} 
                        onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
                        className="w-[85%] h-auto max-h-[400px] object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 origin-bottom" 
                      />
                    </div>
                    
                    <div className="text-center mt-6 w-full">
                      <h3 className="font-bold text-[18px] text-[#333] mb-2">{dealProduct.title}</h3>
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <span className="text-[16px] font-bold text-[#689f38]">₹{dealProduct.price.toLocaleString('en-IN')}</span>
                        {dealProduct.original_price && <span className="text-[15px] text-[#999] line-through">₹{dealProduct.original_price.toLocaleString('en-IN')}</span>}
                      </div>
                      <Link href={`/shop/${dealProduct.id}`} className="bg-[#78b144] text-white text-[12px] font-bold px-10 py-3.5 rounded-sm hover:bg-[#689f38] transition-colors inline-flex items-center justify-center tracking-wide w-[80%] mx-auto">
                        SHOP NOW <ArrowRight className="w-3.5 h-3.5 ml-2" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
