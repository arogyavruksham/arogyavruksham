'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Home, BookOpen, ShoppingCart, User } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAnnouncement } from '@/lib/announcement'

const PottedPlantIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 11v5a5 5 0 0 0 10 0v-5" />
    <path d="M5 7h14l-1 4H6Z" />
    <path d="M12 7V3" />
    <path d="M8 5c1 0 2-1 2-2" />
    <path d="M16 5c-1 0-2-1-2-2" />
  </svg>
)

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const announcement = useAnnouncement()
  const { toggleCart, items, isOpen: isCartOpen, setCartOpen } = useCartStore()
  const { isAuthenticated, setAuthModalOpen, isAuthModalOpen } = useAuthStore()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('home')
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Sync active tab with route when pathname changes or cart state toggles
  useEffect(() => {
    if (isCartOpen) {
      setActiveTab('cart')
    } else if (pathname === '/') {
      setActiveTab('home')
    } else if (pathname?.startsWith('/shop')) {
      setActiveTab('shop')
    } else if (pathname?.startsWith('/blogs') || pathname?.startsWith('/journal')) {
      setActiveTab('journal')
    } else if (pathname?.startsWith('/profile')) {
      setActiveTab('profile')
    }
  }, [pathname, isCartOpen])

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, href: '/' },
    { id: 'shop', label: 'Shop', icon: PottedPlantIcon, href: '/shop' },
    { id: 'journal', label: 'Journal', icon: BookOpen, href: '/blogs' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, onClick: () => toggleCart(), badge: itemCount },
    { id: 'profile', label: 'Profile', icon: User, onClick: () => {
        if (!isAuthenticated) setAuthModalOpen(true)
        else router.push('/profile')
      } 
    },
  ]

  const handleTabClick = (item: typeof navItems[0]) => {
    setActiveTab(item.id)
    if (item.id !== 'cart' && isCartOpen) {
      setCartOpen(false)
    }
    if (item.onClick) {
      item.onClick()
    } else if (item.href) {
      router.push(item.href)
    }
  }

  if (pathname === '/checkout' || isAuthModalOpen) return null

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
      {/* Announcement Banner positioned above Bottom Nav */}
      {announcement.is_active && (
        <div 
          style={{ backgroundColor: announcement.bg_color, color: announcement.text_color }}
          className="py-1.5 px-3 text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-[0_-2px_8px_rgba(0,0,0,0.1)] border-b border-black/10 transition-colors duration-300"
        >
          <span className="truncate">{announcement.mobile_text || announcement.text}</span>
          {announcement.link_text && announcement.link_url && (
            <>
              <span className="opacity-50">|</span>
              <Link href={announcement.link_url} className="underline font-black hover:opacity-80 transition-opacity shrink-0">
                {announcement.link_text}
              </Link>
            </>
          )}
        </div>
      )}

      <div className="bg-white/98 backdrop-blur-md border-t border-gray-100 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-16 px-2 max-w-md mx-auto">
          {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          const content = (
            <>
              {/* Sliding green background animation */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavHighlight"
                  className="absolute inset-x-1 inset-y-1 bg-[#235839] rounded-2xl z-0"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex flex-col items-center space-y-1">
                <div className="relative">
                  <Icon 
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-[#A4E4BA]' : 'text-[#4A5E51]'
                    }`} 
                  />
                  
                  {/* Badge for cart items */}
                  {mounted && item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[15px] border border-white shadow-xs">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span 
                  className={`text-[11px] font-bold tracking-tight transition-colors duration-200 ${
                    isActive ? 'text-[#A4E4BA]' : 'text-gray-600'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </>
          )
          
          if (item.href && !item.onClick) {
            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                onClick={() => {
                  setActiveTab(item.id)
                  if (isCartOpen) setCartOpen(false)
                }}
                className="relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-colors focus:outline-none"
              >
                {content}
              </Link>
            )
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className="relative flex flex-col items-center justify-center flex-1 py-1.5 px-2 transition-colors focus:outline-none"
            >
              {content}
            </button>
          )
        })}
      </div>
    </div>
    </nav>
  )
}

