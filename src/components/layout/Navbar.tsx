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
  const [isSticky, setIsSticky] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsSticky(true)
        // Use requestAnimationFrame to ensure the 'fixed' and '-translate-y-full' 
        // are applied before transitioning to 'translate-y-0'
        requestAnimationFrame(() => {
          setIsAnimating(true)
        })
      } else {
        setIsSticky(false)
        setIsAnimating(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    // Initialize on mount
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
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
      {/* Announcement Bar (Scrolls away) */}
      <div className="w-full bg-[#166534] text-white py-2.5 px-4 text-center flex items-center justify-center relative z-40">
        <p className="text-[13px] md:text-[14px] font-medium tracking-wide">
          ✨ Free shipping on all orders over ₹999! Shop now and grow your green space. 🌿
        </p>
      </div>

      {/* Wrapper to prevent layout shift when header becomes fixed */}
      <div className={isSticky ? 'h-[80px]' : 'h-0'} />
      <header 
        className={`w-full py-5 z-50 transition-all duration-300 ease-in-out ${
          isSticky 
            ? `fixed top-0 left-0 bg-white/95 backdrop-blur-sm shadow-md ${isAnimating ? 'translate-y-0' : '-translate-y-full'}` 
            : 'relative bg-white translate-y-0'
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex items-center justify-between">
          
          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <img 
              src="/logo.png" 
              alt="Arogyavruksham Logo" 
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-[22px] text-gray-900 tracking-tight">Arogyavruksham</span>
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
