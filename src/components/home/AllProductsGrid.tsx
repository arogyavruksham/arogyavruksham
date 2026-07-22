'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { ProductCard } from '@/components/shop/ProductCard'
import { normalizeProducts } from '@/lib/categories'

export function AllProductsGrid() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProducts() {
      // Fetch products to show on the homepage
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(12)
      
      if (data) {
        setProducts(normalizeProducts(data))
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  return (
    <section className="bg-[#fcfafc] py-16 border-t border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
        <h2 className="font-serif text-3xl md:text-5xl font-medium text-gray-900 tracking-normal mb-4">OUR COLLECTION</h2>
        <p className="text-gray-500 font-sans text-sm md:text-base max-w-2xl mx-auto">Explore our finest selection of handwoven silk, soft cottons, and elegant georgettes.</p>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A73E8]" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No products available at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                title={product.title}
                price={product.price}
                original_price={product.original_price}
                category={product.category}
                imageUrl={product.image_url}
                stock_count={product.stock_count}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
