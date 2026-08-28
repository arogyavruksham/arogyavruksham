'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2, Heart, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' as const }
  })
}

function FeaturedProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [liked, setLiked] = useState(false)
  const { addItem } = useCartStore()

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} 
      className="w-[280px] md:w-[320px] shrink-0 snap-start h-full pb-4 pt-2">
      <div className="group flex flex-col h-full bg-white rounded-3xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100">
        
        {/* Top Badges */}
        <div className="flex items-center justify-between z-10 w-full mb-3">
          <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase ${product.original_price ? 'bg-[#D27D56] text-white shadow-sm' : 'bg-[#F4F6F4] text-[#1E4631]'}`}>
            {product.original_price ? 'Sale' : 'Featured'}
          </span>
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }} 
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        </div>

        {/* Image Box */}
        <Link href={`/shop/${product.id}`} className="relative bg-[#FAFAF7] rounded-2xl aspect-square flex items-center justify-center p-6 mb-5 overflow-hidden transition-all duration-300">
          <motion.img 
            src={product.image_url} 
            alt={product.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'; }}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply origin-bottom"
            animate={{ scale: hovered ? 1.1 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </Link>

        {/* Info */}
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

export function NewArrivalsSlider() {
  const carousel = useRef<HTMLDivElement>(null)
  const [newProducts, setNewProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const scrollLeft = () => { if (carousel.current) carousel.current.scrollBy({ left: -340, behavior: 'smooth' }) }
  const scrollRight = () => { if (carousel.current) carousel.current.scrollBy({ left: 340, behavior: 'smooth' }) }

  useEffect(() => {
    async function fetchNewArrivals() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: true }).limit(8)
      if (data) setNewProducts(normalizeProducts(data))
      setLoading(false)
    }
    fetchNewArrivals()
  }, [])

  return (
    <section className="py-24 bg-white overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="mb-12 border-b border-gray-200 flex items-end justify-between pb-4">
          <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none">Featured Products</h2>
          <div className="flex gap-2">
            <button onClick={scrollLeft} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#F4F6F4] hover:text-[#1E4631] transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollRight} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-[#F4F6F4] hover:text-[#1E4631] transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div ref={carousel} className="overflow-x-auto pb-8 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory flex gap-6 md:gap-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex justify-center py-20 w-full"><Loader2 className="w-8 h-8 animate-spin text-[#1E4631]" /></div>
          ) : (
            <>
              {newProducts.map((product, i) => (
                <FeaturedProductCard key={product.id} product={product} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
