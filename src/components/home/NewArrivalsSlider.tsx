'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: 'easeOut' as const }
  })
}

function FeaturedProductCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)} className="w-[260px] md:w-[300px] shrink-0 snap-start h-full">
      <Link href={`/shop/${product.id}`} className="group flex flex-col h-full">
        {/* Image Box */}
        <div className="relative bg-[#f8f9fb] aspect-[4/5] flex items-center justify-center p-6 mb-4 overflow-hidden transition-all duration-300">
          {/* Badge */}
          {product.original_price && (
            <span className="absolute top-4 left-4 z-10 bg-[#ffb156] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">SALE</span>
          )}
          {index === 2 && !product.original_price && (
            <span className="absolute top-4 left-4 z-10 bg-[#ff6b6b] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">HOT</span>
          )}

          <motion.img 
            src={product.image_url} 
            alt={product.title}
            className="w-[85%] h-[85%] object-contain mix-blend-multiply origin-bottom"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Info */}
        <div className="text-center px-2 flex-1 flex flex-col justify-start">
          <h4 className="text-[14px] font-bold text-[#222] mb-1 leading-tight group-hover:text-[#689f38] transition-colors">{product.title}</h4>
          <div className="flex items-center justify-center gap-2">
            {product.original_price && <span className="text-[13px] text-[#999] line-through">${product.original_price.toLocaleString('en-IN')}</span>}
            <span className="text-[13px] font-bold text-[#689f38]">${product.price.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function NewArrivalsSlider() {
  const carousel = useRef<HTMLDivElement>(null)
  const [newProducts, setNewProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const scrollLeft = () => { if (carousel.current) carousel.current.scrollBy({ left: -320, behavior: 'smooth' }) }
  const scrollRight = () => { if (carousel.current) carousel.current.scrollBy({ left: 320, behavior: 'smooth' }) }

  useEffect(() => {
    async function fetchNewArrivals() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: true }).limit(8)
      if (data) setNewProducts(normalizeProducts(data))
      setLoading(false)
    }
    fetchNewArrivals()
  }, [])

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
          className="mb-10 border-b border-[#f0f0f0] flex items-end justify-between pb-3">
          <h2 className="font-serif text-[28px] md:text-[32px] text-[#333] font-normal leading-none">Featured Products</h2>
          <div className="flex gap-3">
            <button onClick={scrollLeft} className="text-[#999] hover:text-[#333] transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={scrollRight} className="text-[#999] hover:text-[#333] transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </motion.div>

        {/* Carousel */}
        <div ref={carousel} className="overflow-x-auto pb-8 scrollbar-hide snap-x snap-mandatory flex gap-6 md:gap-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex justify-center py-20 w-full"><Loader2 className="w-8 h-8 animate-spin text-[#689f38]" /></div>
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
