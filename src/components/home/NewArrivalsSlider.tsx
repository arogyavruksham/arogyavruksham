'use client'

import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/ProductCard'
import { normalizeProducts } from '@/lib/categories'

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

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  }
  const cardVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' as const } }
  }

  return (
    <section className="py-12 bg-white" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-sm text-gray-500 mt-1">Handpicked from our bestsellers</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3">
            <button onClick={scrollLeft} className="w-9 h-9 border border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors rounded-sm">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={scrollRight} className="w-9 h-9 border border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors rounded-sm">
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link href="/shop" className="text-xs text-primary font-bold hover:underline ml-2">See All</Link>
          </motion.div>
        </div>

        <div ref={carousel} className="overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex gap-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="flex justify-center py-12 w-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}
              className="flex gap-4 w-max">
              {newProducts.map((product) => (
                <motion.div key={product.id} variants={cardVariants} className="w-[240px] md:w-[280px] shrink-0 snap-start">
                  <ProductCard
                    id={product.id} title={product.title} price={product.price}
                    original_price={product.original_price} category={product.category}
                    imageUrl={product.image_url} stock_count={product.stock_count}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
