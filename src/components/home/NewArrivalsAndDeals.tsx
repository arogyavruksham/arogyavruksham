'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'

const TABS = ['Top Rating', 'Best Sellers', 'Featured']

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
        className="relative bg-[#f2f2f2] aspect-[4/5] flex items-center justify-center mb-4 overflow-hidden"
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

export function NewArrivalsAndDeals() {
  const [activeTab, setActiveTab] = useState('Top Rating')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12)
      if (data && data.length > 0) {
        setAllProducts(normalizeProducts(data))
      } else {
        setAllProducts(Array(12).fill(null))
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const displayProducts = allProducts.slice(0, 4)

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16">
        
        {/* Header with Tabs */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-10">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[17px] font-semibold tracking-wide whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab
                    ? 'text-[#166534]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Link
            href="/shop"
            className="text-[#166534] text-[15px] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            view all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="relative">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#166534]" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              >
                {displayProducts.map((product, i) => (
                  <FeaturedCard
                    key={product?.id || i}
                    product={product}
                    index={i}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
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
