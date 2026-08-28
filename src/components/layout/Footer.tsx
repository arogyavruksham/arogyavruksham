'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronsUp } from 'lucide-react'
import { useHomepageImages } from '@/lib/homepageImages'

export function Footer() {
  const pathname = usePathname()
  const images = useHomepageImages()

  // Only show on Homepage and Product pages
  const isHomePage = pathname === '/'
  const isProductPage = pathname.startsWith('/shop/') && pathname.split('/').length === 3

  if (!isHomePage && !isProductPage) {
    return null
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const igKeys = ['footer_ig_1', 'footer_ig_2', 'footer_ig_3', 'footer_ig_4', 'footer_ig_5', 'footer_ig_6', 'footer_ig_7', 'footer_ig_8']

  return (
    <>
      {/* ─── MOBILE VIEW (Botanical preview — PRESERVED) ─── */}
      <footer className="block md:hidden bg-[#EEEDEC] pt-10 pb-24 px-6 font-sans text-center border-t border-gray-200/60">
        <Link href="/" className="inline-block mb-6">
          <h2 className="text-[26px] font-serif font-bold text-[#1E4631] tracking-tight">
            Arogyavruksham
          </h2>
        </Link>
        <ul className="space-y-4 font-semibold text-[13px] text-[#4A5E51] mb-8">
          <li><Link href="/" className="hover:text-[#1E4631] transition-colors">About Us</Link></li>
          <li><Link href="/" className="hover:text-[#1E4631] transition-colors">Plant Care Guide</Link></li>
          <li><Link href="/policies/shipping" className="hover:text-[#1E4631] transition-colors">Shipping &amp; Returns</Link></li>
          <li><Link href="/contact" className="hover:text-[#1E4631] transition-colors">Contact Us</Link></li>
        </ul>
        <div className="border-t border-gray-300/60 pt-6">
          <p className="text-[11px] font-medium text-gray-500">
            &copy; {new Date().getFullYear()} Arogyavruksham Botanical Co.
          </p>
        </div>
      </footer>

      {/* ─── DESKTOP VIEW — Redesigned Footer ─── */}
      <footer className="hidden md:block bg-[#F5F5F0] text-[#1a1a1a] pt-16 pb-8 font-sans mt-auto">
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-3 gap-12 lg:gap-16 mb-16">

            {/* Column 1: Brand + Address */}
            <div>
              <Link href="/" className="inline-block mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-[#1E4631] text-xl">🌿</span>
                  <h3 className="font-serif text-[22px] font-bold text-[#1E4631]">
                    Arogyavruksham
                  </h3>
                </div>
              </Link>

              <div className="space-y-4">
                <div>
                  <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">Address</p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                    Shop No 15, Ground Floor, Bombay Super Height, 1,<br />
                    Pedak Rd, Arya Nagar, Rajkot,<br />
                    Gujarat 360003
                  </p>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1a1a1a] mb-1">Need Help?</p>
                  <p className="text-[13px] text-gray-500">Call: +91 8000027143</p>
                </div>
              </div>

              {/* Social Icons */}
              <div className="flex gap-3 mt-6">
                {[
                  { label: 'Facebook', path: 'M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z' },
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  { label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    aria-label={social.label}
                    className="w-9 h-9 rounded-full bg-[#1E4631] flex items-center justify-center text-white hover:bg-[#D27D56] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Column 2: Follow on Instagram */}
            <div>
              <h3 className="font-bold text-[14px] tracking-wide mb-6">
                Follow on Instagram
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {igKeys.map((key) => (
                  <a
                    key={key}
                    href="#"
                    className="aspect-square rounded-[10px] overflow-hidden group"
                  >
                    <img
                      src={images[key]}
                      alt="Instagram"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* Column 3: Information Links */}
            <div>
              <h3 className="font-bold text-[14px] tracking-wide mb-6">
                Information
              </h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <Link href="/" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">About Us</Link>
                <Link href="/policies/privacy" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Privacy Policy</Link>
                <Link href="/contact" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Contact Us</Link>
                <Link href="/policies/shipping" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Delivery Information</Link>
                <Link href="/shop" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Specials</Link>
                <Link href="/shop" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Brands</Link>
                <Link href="/policies/terms" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Terms &amp; Conditions</Link>
                <Link href="/shop" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Site Map</Link>
                <Link href="/policies/refund" className="text-[13px] text-gray-500 hover:text-[#1E4631] transition-colors">Refund Policy</Link>
              </div>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="pt-6 border-t border-gray-300/60 flex items-center justify-between">
            <p className="text-[13px] text-gray-500">
              Copyright &copy; {new Date().getFullYear()} Arogyavruksham. All Rights Reserved.
            </p>

            {/* Payment Icons */}
            <div className="flex items-center gap-4">
              {/* Mastercard */}
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center shadow-sm">
                <svg viewBox="0 0 40 24" className="w-8 h-5">
                  <circle cx="15" cy="12" r="8" fill="#EB001B" opacity="0.8" />
                  <circle cx="25" cy="12" r="8" fill="#F79E1B" opacity="0.8" />
                  <path d="M20 5.8a8 8 0 010 12.4 8 8 0 000-12.4z" fill="#FF5F00" opacity="0.8" />
                </svg>
              </div>
              {/* UPI */}
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center shadow-sm text-[9px] font-black text-[#1E4631]">
                UPI
              </div>
              {/* Visa */}
              <div className="w-10 h-6 bg-white rounded flex items-center justify-center shadow-sm text-[10px] font-black text-[#1A1F71] italic">
                VISA
              </div>
            </div>

            <button
              onClick={scrollToTop}
              className="w-10 h-10 bg-[#1E4631] rounded-full flex items-center justify-center text-white hover:bg-[#153424] transition-colors shadow-lg"
              aria-label="Scroll to top"
            >
              <ChevronsUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </>
  )
}
