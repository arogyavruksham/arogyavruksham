'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Package, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useEffect, useState } from 'react'

export function BottomNav() {
  const pathname = usePathname()
  const { toggleCart, items } = useCartStore()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  if (pathname?.startsWith('/admin') || pathname?.includes('/shop/')) {
    return null // Hide on admin and product details pages (which have fixed Add to Cart)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-around h-16 px-2">
        <Link 
          href="/" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/' ? 'text-primary' : 'text-gray-500'}`}
        >
          <Home className={`w-6 h-6 ${pathname === '/' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        
        <Link 
          href="/profile?tab=history" 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === '/profile' ? 'text-primary' : 'text-gray-500'}`}
        >
          <Package className={`w-6 h-6 ${pathname === '/profile' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>

        <button 
          id="mobile-cart-icon"
          onClick={toggleCart}
          className="flex flex-col items-center justify-center w-full h-full space-y-1 text-gray-500 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6" />
            {mounted && itemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </button>
      </div>
    </nav>
  )
}
