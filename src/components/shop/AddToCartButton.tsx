'use client'

import { useCartStore } from '@/store/cartStore'
import { ShoppingBag } from 'lucide-react'

export function AddToCartButton({ product }: { product: any }) {
  const addItem = useCartStore(state => state.addItem)

  return (
    <button 
      onClick={() => addItem({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrl: product.image_url,
        stock_count: product.stock_count
      })}
      className="w-full bg-primary hover:bg-primary-light text-white font-sans font-semibold py-4 rounded-md transition-colors flex items-center justify-center gap-2 shadow-md shadow-primary/20"
    >
      <ShoppingBag className="w-5 h-5" />
      Add to Cart
    </button>
  )
}
