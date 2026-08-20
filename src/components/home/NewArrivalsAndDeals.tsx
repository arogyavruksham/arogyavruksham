'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Loader2, Heart, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  })
}

function MobileProductCard({ product }: { product: any }) {
  const [liked, setLiked] = useState(false)
  const { addItem } = useCartStore()

  return (
    <div className="bg-[#F6F4ED] rounded-3xl p-4 relative flex flex-col justify-between">
      {/* Top row badges */}
      <div className="flex items-center justify-between z-10 w-full mb-2">
        <span className="bg-white/90 backdrop-blur-sm text-[#11311F] font-bold text-[9px] uppercase tracking-widest px-3 py-1 rounded-full">
          {product.original_price ? 'SALE' : 'NEW'}
        </span>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }} 
          className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-400 shadow-sm transition-colors"
        >
          <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
        </button>
      </div>

      {/* Product Image Link */}
      <Link href={`/shop/${product.id}`} className="flex flex-col items-center my-3">
        <div className="w-full h-[150px] flex items-center justify-center">
          <img 
            src={product.image_url} 
            alt={product.title} 
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="h-full w-full object-contain mix-blend-multiply origin-bottom" 
          />
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3">
        <Link href={`/shop/${product.id}`}>
          <h4 className="text-[15px] font-serif font-medium text-[#11311F] leading-tight mb-1 truncate">{product.title}</h4>
          <p className="text-[11px] text-gray-500 font-medium capitalize">{product.category || 'Indoor Plant'}</p>
        </Link>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-[#11311F]">₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && <span className="text-[11px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
          </div>
          <button 
            onClick={(e) => { e.preventDefault(); addItem(product); }} 
            className="w-9 h-9 rounded-full bg-[#11311F] text-white flex items-center justify-center shadow-md active:scale-90 transition-transform"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

function PremiumProductCard({ product, index }: { product: any; index: number }) {
  const { addItem } = useCartStore()

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" className="group cursor-pointer">
      <Link href={`/shop/${product.id}`} className="block relative">
        <div className="relative aspect-[3/4] bg-[#F9F8F4] overflow-hidden mb-6 rounded-3xl transition-colors duration-500 group-hover:bg-[#EBE8DF]">
          {product.original_price && (
            <span className="absolute top-5 left-5 z-10 bg-white/90 backdrop-blur-sm text-[#11311F] text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">SALE</span>
          )}
          <img 
            src={product.image_url} 
            alt={product.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 ease-[0.16,1,0.3,1] p-10 origin-bottom"
          />
          <button 
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            className="absolute bottom-5 right-5 w-12 h-12 bg-white text-[#11311F] rounded-full flex items-center justify-center shadow-lg opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#11311F] hover:text-white"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-col px-1">
          <h4 className="text-[17px] font-serif font-medium text-[#11311F] mb-1.5">{product.title}</h4>
          <div className="flex items-center gap-3">
            <span className="text-[15px] font-bold text-[#11311F]">₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && <span className="text-[13px] text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function NewArrivalsAndDeals() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(6)
      if (data) {
        setAllProducts(normalizeProducts(data))
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <>
      {/* ─── MOBILE VIEW ─── */}
      <section className="block md:hidden bg-[#FCFBF8] py-12 px-5">
        <div className="flex flex-col mb-8 text-center">
          <h2 className="font-serif text-[32px] font-medium text-[#11311F] tracking-tight mb-2">Curated Selection</h2>
          <p className="text-gray-500 text-sm">Discover our most recent arrivals.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[#11311F]" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {allProducts.map((product) => (
              <MobileProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="mt-10 flex justify-center">
          <Link href="/shop" className="text-[#11311F] text-[12px] font-bold tracking-widest uppercase border-b border-[#11311F] pb-1 hover:opacity-70 transition-opacity">
            View All Plants
          </Link>
        </div>
      </section>

      {/* ─── DESKTOP VIEW ─── */}
      <section ref={ref} className="hidden md:block py-24 bg-[#FCFBF8]">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-end justify-between mb-16"
          >
            <div>
              <h2 className="font-serif text-5xl font-medium text-[#11311F] tracking-tight mb-4">Curated Selection</h2>
              <p className="text-gray-500 text-lg">Handpicked botanical specimens for your home.</p>
            </div>
            <Link href="/shop" className="group inline-flex items-center text-[13px] font-bold tracking-widest uppercase text-[#11311F] pb-2 border-b border-[#11311F]/20 hover:border-[#11311F] transition-colors">
              Explore All <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 animate-spin text-[#11311F]" /></div>
          ) : (
            <AnimatePresence>
              {inView && (
                <div className="grid grid-cols-3 gap-8 gap-y-16">
                  {allProducts.map((product, i) => (
                    <PremiumProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  )
}
