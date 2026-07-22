'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronsUp } from 'lucide-react'

export function Footer() {
  const pathname = usePathname()

  // Only show on Homepage and Product pages
  const isHomePage = pathname === '/'
  const isProductPage = pathname.startsWith('/shop/') && pathname.split('/').length === 3

  if (!isHomePage && !isProductPage) {
    return null
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-white text-black border-t border-gray-200 mt-auto pt-16 pb-8 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Column 1: Locate us */}
          <div className="space-y-6">
            <h3 className="font-bold text-sm tracking-wide">Locate us</h3>
            <div className="text-[13px] leading-relaxed text-gray-600">
              <p>Shop No 15 , Ground Floor, Bombay Super Height, 1,</p>
              <p>Pedak Rd, opposite Shri Atal Bihari Vajpayee Auditorium, Arya Nagar, Rajkot,</p>
              <p>Gujarat 360003</p>
              <p>shopping easier. <a href="#" className="font-bold text-black underline hover:no-underline">Show on google maps.</a></p>
            </div>
            
            <div className="text-[13px] text-gray-600 space-y-1">
              <p>+918000027143</p>
              <p>Arogyavruksham.silks@gmail.com</p>
            </div>

            <div className="flex gap-3 pt-2">
              <a href="#" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Main menu */}
          <div>
            <h3 className="font-bold text-sm tracking-wide mb-6">Main menu</h3>
            <ul className="space-y-4 text-[13px] text-gray-600">
              <li><Link href="/" className="hover:text-black transition-colors">HOME</Link></li>
              <li><Link href="/shop" className="hover:text-black transition-colors">NEW ARRIVAL</Link></li>
              <li><Link href="/shop?category=Silk" className="hover:text-black transition-colors">PATOLA PLANT</Link></li>
              <li><Link href="/shop?category=Dupatta" className="hover:text-black transition-colors">PATOLA DUPATTA</Link></li>
              <li><Link href="#" className="hover:text-black transition-colors">For Wholesale</Link></li>
            </ul>
          </div>
          
          {/* Column 3: Our Policys */}
          <div>
            <h3 className="font-bold text-sm tracking-wide mb-6">Our Policys</h3>
            <ul className="space-y-4 text-[13px] text-gray-600">
              <li><Link href="#" className="hover:text-black transition-colors">Search</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">Contact Information</Link></li>
              <li><Link href="/policies/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
              <li><Link href="/policies/refund" className="hover:text-black transition-colors">Refund & Exchange Policy</Link></li>
              <li><Link href="/policies/shipping" className="hover:text-black transition-colors">Shipping Policy</Link></li>
              <li><Link href="/policies/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          {/* Column 4: Sign Up to Newsletter */}
          <div>
            <h3 className="font-bold text-sm tracking-wide mb-6">Sign Up to Newsletter</h3>
            <p className="text-[13px] text-gray-600 leading-relaxed mb-6">
              Sign up for 10% off your first purchase and free shipping. Updates information on Sales and Offers.
            </p>
            
            <form className="flex mb-6" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email..." 
                className="flex-1 border border-gray-300 border-r-0 px-4 py-3 text-[13px] focus:outline-none focus:border-black"
                required
              />
              <button 
                type="submit" 
                className="bg-black text-white px-8 py-3 text-[13px] font-bold hover:bg-gray-800 transition-colors"
              >
                Sign Up
              </button>
            </form>

            <p className="text-[12px] text-gray-500 leading-relaxed">
              ***By entering the e-mail you accept the <a href="/policies/terms" className="font-bold text-black hover:underline">terms and conditions</a> and the <a href="/policies/privacy" className="font-bold text-black hover:underline">privacy policy</a>.
            </p>
          </div>
          
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between relative">
          <p className="text-[13px] text-gray-600">
            &copy; {new Date().getFullYear()} Arogyavruksham Silks. All rights reserved.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="mt-4 md:mt-0 w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors shadow-lg"
            aria-label="Scroll to top"
          >
            <ChevronsUp className="w-5 h-5" />
          </button>
        </div>
        
      </div>
    </footer>
  )
}
