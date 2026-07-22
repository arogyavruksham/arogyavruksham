import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/shop/ProductCard'
import { normalizeProducts } from '@/lib/product-helper'

export default async function ShopPage(props: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const searchParams = await props.searchParams
  const category = searchParams.category
  const q = searchParams.q
  
  let products: any[] = []
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    
    if (data && data.length > 0) {
      const normalized = normalizeProducts(data)
      products = normalized.filter(p => {
        let matchesCat = true
        let matchesQ = true
        if (category) {
          matchesCat = p.category?.toLowerCase() === category.toLowerCase() || p.category?.toLowerCase() === decodeURIComponent(category).toLowerCase()
        }
        if (q) {
          const queryStr = q.toLowerCase()
          matchesQ = p.title?.toLowerCase().includes(queryStr) || p.category?.toLowerCase().includes(queryStr) || p.description?.toLowerCase().includes(queryStr)
        }
        return matchesCat && matchesQ
      })
    }
  } catch (e) {
    console.error("Failed to fetch products:", e)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-primary mb-4">
          {q ? `Search Results for "${q}"` : category ? `${category} Plants` : 'All Collection'}
        </h1>
        <div className="w-16 h-1 bg-secondary mb-6"></div>
        <p className="font-sans text-foreground/80 max-w-2xl">
          Browse our exquisite collection of premium plants. Use the filters to find the perfect style for your next occasion.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-sans">
          No products found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-8">
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
  )
}
