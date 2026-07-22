'use client'

'use client'

import { MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function WhatsAppButton() {
  const pathname = usePathname()

  if (pathname !== '/') {
    return null
  }
  return (
    <a
      href="https://wa.me/918328153791"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 md:bottom-6 right-6 z-[100] bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 md:w-8 md:h-8" />
      {/* Optional tooltip */}
      <span className="absolute right-full mr-4 bg-white text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Chat with us!
      </span>
    </a>
  )
}
