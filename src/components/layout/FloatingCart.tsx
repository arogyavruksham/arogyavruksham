'use client'

import { usePathname } from 'next/navigation'
import { ShoppingCart, ChevronRight } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'

export function FloatingCart() {
  const pathname = usePathname()
  const { items, toggleCart } = useCartStore()
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  // Hide if no items, or on admin pages, or on product detail pages (which have their own add to cart)
  if (itemCount === 0 || pathname?.startsWith('/admin') || pathname?.includes('/shop/')) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50">
      <button 
        onClick={toggleCart}
        className="md:hidden fixed bottom-20 right-4 z-50 bg-[#FF3B30] text-white pl-4 pr-3 py-3 rounded-full shadow-lg shadow-red-500/30 flex items-center gap-3 active:scale-95 transition-transform"
      >
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#333333] text-[11px] font-bold text-white border-2 border-[#D93844]">
            {itemCount}
          </span>
        </div>
        <span className="font-bold text-sm tracking-wide">View Cart</span>
        <ChevronRight className="w-5 h-5 ml-1" />
      </button>
    </div>
  )
}
