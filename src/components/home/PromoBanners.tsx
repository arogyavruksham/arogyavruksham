'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'

function FeaturedCard({ product, index }: { product: any; index: number }) {
  const { addItem } = useCartStore()

  // Use the image text matching the design if possible, or product name
  const title = product?.title || "Peperomia Ginny"
  const price = product?.price || 25

  return (
    <div className="flex flex-col h-full bg-white transition-all duration-300">
      {/* Image Container */}
      <Link
        href={`/shop/${product?.id || '#'}`}
        className="relative bg-[#f2f2f2] aspect-square flex items-center justify-center mb-4 overflow-hidden"
      >
        <img
          src={product?.image_url || `https://placehold.co/400x500/eeeeee/cccccc?text=${encodeURIComponent(title)}`}
          alt={title}
          className="w-full h-full object-cover mix-blend-multiply"
        />
      </Link>

      {/* Info */}
      <div className="flex flex-col px-1">
        <div className="flex items-center justify-between mb-3">
          <Link href={`/shop/${product?.id || '#'}`}>
            <h4 className="text-[15px] font-semibold text-[#166534] leading-tight truncate">
              {title}
            </h4>
          </Link>
          <span className="text-[15px] font-semibold text-[#166534]">
            ${price}
          </span>
        </div>
        
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-gray-400">Pot color</span>
            <div className="flex items-center gap-1.5">
              <button className="w-3.5 h-3.5 rounded-full bg-[#222222] border border-gray-300"></button>
              <button className="w-3.5 h-3.5 rounded-full bg-[#fca5a5] border border-gray-300"></button>
              <button className="w-3.5 h-3.5 rounded-full bg-[#d2b48c] border border-gray-300"></button>
            </div>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); if (product) addItem(product) }}
            className="px-6 py-1.5 border border-[#166534] text-[#166534] text-[13px] font-medium hover:bg-[#166534] hover:text-white transition-colors"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  )
}

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4)
      if (data && data.length > 0) {
        setProducts(normalizeProducts(data))
      } else {
        // Fallback to placeholders if no products
        setProducts(Array(4).fill(null))
      }
      setLoading(false)
    }
    fetchFeatured()
  }, [])

  return (
    <section className="py-20 bg-white" ref={ref}>
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 relative">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <h2 className="font-sans text-[28px] text-[#166534] font-semibold leading-none">
            Featured Plant
          </h2>
          <Link
            href="/shop"
            className="text-[#166534] text-[15px] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            view all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Carousel Grid */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, i) => (
                <FeaturedCard key={product?.id || i} product={product} index={i} />
              ))}
            </div>
          )}
          
          {/* Circular next button (carousel float) */}
          <button className="absolute -right-5 top-[40%] w-12 h-12 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex items-center justify-center text-[#166534] hover:bg-gray-50 transition-colors z-10 hidden lg:flex">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  )
}
