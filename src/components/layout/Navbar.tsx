'use client'

import Link from 'next/link'
import { ShoppingBag, User, Menu } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AddressModal } from './AddressModal'

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { items, toggleCart } = useCartStore()
  const { isAuthenticated, setAuthModalOpen } = useAuthStore()
  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const [mounted, setMounted] = useState(false)
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on admin routes
  if (pathname?.startsWith('/admin')) return null

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/shop' },
    { label: 'Contacts', href: '/contact' },
    { label: 'Shop By Category', href: '/shop#categories' },
  ]

  return (
    <>
      <header className="w-full bg-white py-5 relative z-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo.png" 
              alt="Arogyavruksham Icon" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-bold text-[19px] text-gray-900 tracking-tight">Arogya</span>
              <span className="font-bold text-[19px] text-gray-900 tracking-tight -mt-1.5">vruksham</span>
            </div>
          </Link>

          {/* Center: Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
              return (
                <Link 
                  key={link.label} 
                  href={link.href}
                  className={`text-[15px] font-semibold transition-colors ${
                    isActive 
                      ? 'text-[#166534]' // Primary Forest Green
                      : 'text-gray-600 hover:text-[#166534]'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right: Icons */}
          <div className="flex items-center gap-7">
            {/* Cart Icon */}
            <button 
              onClick={toggleCart} 
              className="relative text-gray-800 hover:text-[#166534] transition-colors"
            >
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
              {mounted && itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#166534] text-[9px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Icon */}
            <button 
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/profile')
                } else {
                  setAuthModalOpen(true)
                }
              }}
              className="text-gray-800 hover:text-[#166534] transition-colors"
            >
              <User className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Divider */}
            <div className="w-[1.5px] h-4 bg-gray-300 hidden md:block rounded-full"></div>

            {/* Hamburger Menu */}
            <button className="text-gray-800 hover:text-[#166534] transition-colors">
              <Menu className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

        </div>
      </header>

      {/* Keep address modal functionality from old navbar if it was used globally */}
      {mounted && (
        <AddressModal 
          isOpen={isAddressModalOpen} 
          onClose={() => setIsAddressModalOpen(false)} 
        />
      )}
    </>
  )
}
