'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Star, Loader2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { supabase } from '@/lib/supabase'

import { ProductCard } from '@/components/shop/ProductCard'
import { normalizeProducts } from '@/lib/categories'

export function BestDealsGrid() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDeals() {
      // Fetch 4 products ordered by creation date for "Just Launched"
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4)
      
      if (data) {
        setDeals(normalizeProducts(data))
      }
      setLoading(false)
    }
    fetchDeals()
  }, [])

  return (
    <section className="bg-white">
      {/* Scrolling Marquee */}
      <div className="w-full bg-white border-y border-gray-100 py-3 overflow-hidden whitespace-nowrap mb-12 flex relative">
        <style>
          {`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 45s linear infinite;
            }
          `}
        </style>
        <div className="animate-marquee flex whitespace-nowrap min-w-max">
              {[...Array(8)].map((_, i) => (
            <span key={i} className="text-xs sm:text-sm font-bold text-gray-700 tracking-widest px-6 flex items-center gap-6">
              🌿 FREE DELIVERY ON ORDERS ABOVE ₹999 <span className="text-primary text-[8px]">◼</span> 100% AUTHENTIC PLANTS <span className="text-primary text-[8px]">◼</span> EXPERT PLANT CARE TIPS INCLUDED <span className="text-primary text-[8px]">◼</span> FRESH FROM NURSERY
            </span>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
        <h2 className="font-sans text-3xl md:text-[40px] font-medium text-gray-900 tracking-normal mb-3">JUST LAUNCHED</h2>
        <p className="text-gray-500 font-sans text-sm md:text-base">Discover our newest arrivals</p>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            Check back later for exciting new products!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <ProductCard
                key={deal.id}
                id={deal.id}
                title={deal.title}
                price={deal.price}
                original_price={deal.original_price}
                category={deal.category}
                imageUrl={deal.image_url}
                stock_count={deal.stock_count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
