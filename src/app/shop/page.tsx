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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-[32px] md:text-[42px] font-bold text-[#1E4631] tracking-tight mb-3">
          {q ? `Search Results for "${q}"` : category && category !== 'All' ? `${category}` : 'Botanical Collection'}
        </h1>
        <div className="w-16 h-1.5 bg-[#235839] rounded-full mb-4"></div>
        <p className="font-sans text-gray-600 max-w-2xl text-[14px]">
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
