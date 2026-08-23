import { createClient } from '@/lib/supabase/server'
import { normalizeProducts } from '@/lib/product-helper'
import { ShopClient } from '@/components/shop/ShopClient'

export default async function ShopPage(props: { searchParams: Promise<{ category?: string, q?: string }> }) {
  const searchParams = await props.searchParams
  const category = searchParams.category
  const q = searchParams.q
  
  let products: any[] = []
  
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    
    if (data && data.length > 0) {
      products = normalizeProducts(data)
    }
  } catch (e) {
    console.error("Failed to fetch products for shop:", e)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 xl:pt-32">
      <div className="mb-16 md:mb-24 max-w-3xl">
        <h1 className="font-serif text-[40px] md:text-[56px] font-medium text-black leading-tight tracking-tight mb-6">
          {q ? `Search Results for "${q}"` : category && category !== 'All' ? `${category}` : 'Botanical Collection'}
        </h1>
        <p className="font-sans text-gray-500 text-[15px] md:text-[16px] leading-relaxed max-w-xl">
          Explore our curated sanctuary of thriving houseplants, desert succulents, and artisan botanicals. Type any plant name below to filter in real time.
        </p>
      </div>

      <ShopClient
        initialProducts={products}
        initialCategory={category}
        initialQuery={q}
      />
    </div>
  )
}
