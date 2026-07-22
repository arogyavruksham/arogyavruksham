import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProductDetailsClient } from '@/components/shop/ProductDetailsClient'
import { ProductCard } from '@/components/shop/ProductCard'
import { Suspense } from 'react'
import { normalizeProduct, normalizeProducts } from '@/lib/product-helper'

async function RelatedProducts({ category, currentId }: { category: string, currentId: string }) {
  const supabase = await createClient()
  const { data: allData } = await supabase
    .from('products')
    .select('*')
    .neq('id', currentId)
    .order('created_at', { ascending: false })
  
  if (!allData || allData.length === 0) return null;
  const normalizedAll = normalizeProducts(allData)
  const relatedData = normalizedAll.filter(p => p.category?.toLowerCase() === category?.toLowerCase()).slice(0, 8)

  if (relatedData.length === 0) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24 mb-12">
      <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">More Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {relatedData.map((related: any) => (
          <ProductCard 
            key={related.id} 
            id={related.id} 
            title={related.title} 
            price={related.price} 
            category={related.category} 
            imageUrl={related.image_url} 
            stock_count={related.stock_count}
          />
        ))}
      </div>
    </div>
  )
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const id = params.id
  
  let product: any = null

  try {
    const supabase = await createClient()
    const { data: rawData, error } = await supabase.from('products').select('*').eq('id', id).single()
    if (rawData) {
      product = normalizeProduct(rawData)
    }
  } catch (e) {
    console.error("Failed to fetch product:", e)
  }

  if (!product) {
    notFound()
  }

  return (
    <ProductDetailsClient product={product}>
      <Suspense fallback={<div className="h-40 flex items-center justify-center mt-16"><div className="w-8 h-8 border-4 border-[#E23F33] border-t-transparent rounded-full animate-spin"></div></div>}>
        <RelatedProducts category={product.category} currentId={product.id} />
      </Suspense>
    </ProductDetailsClient>
  )
}
