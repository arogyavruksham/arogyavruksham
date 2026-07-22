'use client'

import { motion, useAnimationControls } from 'framer-motion'
import Link from 'next/link'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/ProductCard'
import { normalizeProducts } from '@/lib/categories'

export function NewArrivalsSlider() {
  const [width, setWidth] = useState(0)
  const carousel = useRef<HTMLDivElement>(null)
  const innerCarousel = useRef<HTMLDivElement>(null)
  const [newProducts, setNewProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const scrollLeft = () => {
    if (carousel.current) {
      carousel.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (carousel.current) {
      carousel.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    async function fetchNewArrivals() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (data) {
        setNewProducts(normalizeProducts(data))
      }
      setLoading(false)
    }
    fetchNewArrivals()
  }, [])

  useEffect(() => {
    if (innerCarousel.current && carousel.current) {
      setWidth(innerCarousel.current.scrollWidth - carousel.current.offsetWidth)
    }
  }, [newProducts])

  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-end mb-6">
          <h2 className="font-sans text-xl font-bold text-gray-900 tracking-tight">
            New Arrival
          </h2>
          <Link href="/shop" className="text-[#FF6B35] font-medium hover:underline text-xs">
            See All
          </Link>
        </div>
          
          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={scrollLeft} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button onClick={scrollRight} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        {/* Sliding Carousel */}
        <div 
          ref={carousel} 
          className="overflow-x-auto pb-12 scrollbar-hide snap-x snap-mandatory flex gap-4 md:gap-8 cursor-grab active:cursor-grabbing"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {loading ? (
            <div className="flex justify-center py-12 w-full">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          ) : newProducts.length === 0 ? (
            <div className="text-center text-white/60 py-12 w-full">
              Stay tuned for our upcoming arrivals!
            </div>
          ) : (
            <motion.div 
              ref={innerCarousel}
              drag="x" 
              dragConstraints={{ right: 0, left: -width }} 
              className="flex gap-4 md:gap-8 w-max"
            >
              {newProducts.map((product) => (
                <div key={product.id} className="w-[280px] md:w-[320px] shrink-0 snap-start">
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    original_price={product.original_price}
                    category={product.category}
                    imageUrl={product.image_url}
                    stock_count={product.stock_count}
                  />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
