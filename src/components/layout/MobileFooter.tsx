'use client'

import Link from 'next/link'
import { ChevronDown, ChevronRight, Mail, Phone, Clock } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function MobileFooter() {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="block md:hidden bg-white text-[#1A1A1A] border-t border-gray-100 pt-8 pb-6 font-sans">
      <div className="px-4">
        
        {/* Why Shop With Us Header */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
          <div className="relative flex items-center gap-2">
            <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37]"></div>
            <h2 className="text-[16px] font-bold text-[#1A1A1A] font-serif tracking-wide">Why Shop With Us</h2>
            <div className="w-1.5 h-1.5 rotate-45 border border-[#D4AF37]"></div>
          </div>
          <div className="h-[1px] w-12 bg-[#D4AF37]"></div>
        </div>

        {/* 4 Features Grid */}
        <div className="grid grid-cols-4 gap-2 mb-8 border-b border-gray-100 pb-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F0F5FF] flex items-center justify-center mb-2 text-[#1A73E8]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"/></svg>
            </div>
            <h3 className="text-[9px] font-bold text-[#1A1A1A] leading-tight mb-1">Authentic<br/>Craftsmanship</h3>
            <p className="text-[8px] text-gray-500 leading-tight">100% Handwoven<br/>Guarantee</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F0F5FF] flex items-center justify-center mb-2 text-[#1A73E8]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="13" x="4" y="4" rx="2"/><path d="M20 9h2v5h-2"/><path d="M4 14h16"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>
            </div>
            <h3 className="text-[9px] font-bold text-[#1A1A1A] leading-tight mb-1">Free Shipping</h3>
            <p className="text-[8px] text-gray-500 leading-tight mt-2">On orders over<br/>₹20,000</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F0F5FF] flex items-center justify-center mb-2 text-[#1A73E8]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <h3 className="text-[9px] font-bold text-[#1A1A1A] leading-tight mb-1">Flexible<br/>Payment</h3>
            <p className="text-[8px] text-gray-500 leading-tight">EMI & Secure<br/>checkout</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#F0F5FF] flex items-center justify-center mb-2 text-[#1A73E8]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
            </div>
            <h3 className="text-[9px] font-bold text-[#1A1A1A] leading-tight mb-1">24/7 Priority<br/>Support</h3>
            <p className="text-[8px] text-gray-500 leading-tight">Personal shopping<br/>assistant</p>
          </div>
        </div>

        {/* 4 Columns Links Grid */}
        <div className="grid grid-cols-4 gap-2 mb-8">
          {/* About Us */}
          <div>
            <div className="w-6 h-6 rounded bg-[#F0F5FF] text-[#1A73E8] flex items-center justify-center mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <h4 className="text-[10px] font-bold text-[#1A1A1A] mb-3 font-serif">About Us</h4>
            <ul className="space-y-2.5">
              {['Company Info', 'News & Media', 'Careers', 'Investors', 'Artisan Network', 'Policies', 'Sustainability'].map(item => (
                <li key={item}>
                  <Link href="#" className="flex items-center justify-between text-[8px] text-gray-500 hover:text-[#1A73E8]">
                    {item} <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <div className="w-6 h-6 rounded bg-[#F0F5FF] text-[#1A73E8] flex items-center justify-center mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h4 className="text-[10px] font-bold text-[#1A1A1A] mb-3 font-serif">Shop</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'Pure Silk', link: '/shop?category=Silk' },
                { name: 'Banarasi Collection', link: '/shop?category=Banarasi' },
                { name: 'Bridal Wear', link: '/shop?category=Bridal' },
                { name: 'Georgette Plants', link: '/shop?category=Georgette' },
                { name: 'Cotton Handloom', link: '/shop?category=Cotton' },
                { name: 'Party Wear', link: '/shop?category=Party' },
                { name: 'New Arrivals', link: '/shop?sort=new' }
              ].map(item => (
                <li key={item.name}>
                  <Link href={item.link} className="flex items-center justify-between text-[8px] text-gray-500 hover:text-[#1A73E8]">
                    {item.name} <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Orders */}
          <div>
            <div className="w-6 h-6 rounded bg-[#F0F5FF] text-[#1A73E8] flex items-center justify-center mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <h4 className="text-[10px] font-bold text-[#1A1A1A] mb-3 font-serif">Orders</h4>
            <ul className="space-y-2.5">
              {['Order Status', 'Shipping & Delivery', 'Returns & Exchanges', 'Price Match Guarantee', 'Product Recalls', 'Gift Cards'].map(item => (
                <li key={item}>
                  <Link href="#" className="flex items-center justify-between text-[8px] text-gray-500 hover:text-[#1A73E8]">
                    {item} <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <div className="w-6 h-6 rounded bg-[#F0F5FF] text-[#1A73E8] flex items-center justify-center mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
            <h4 className="text-[10px] font-bold text-[#1A1A1A] mb-3 font-serif">Support</h4>
            <ul className="space-y-2.5">
              {['Help Center', 'Contact Us', 'Arogyavruksham Silks Guarantee', 'FAQ', 'Size Guide', 'Track Your Order'].map(item => (
                <li key={item}>
                  <Link href={item === 'Contact Us' ? '/contact' : '#'} className="flex items-center justify-between text-[8px] text-gray-500 hover:text-[#1A73E8]">
                    {item} <ChevronRight className="w-2.5 h-2.5 text-gray-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="bg-[#F8FAFC] rounded-xl p-4 flex flex-col gap-3 mb-6 border border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#1A73E8] shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-[#1A1A1A]">Subscribe to our newsletter</h4>
              <p className="text-[9px] text-gray-500">Get updates on new collections, offers & more</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-[10px] focus:outline-none focus:border-[#1A73E8]"
            />
            <button className="bg-[#1A73E8] text-white px-4 py-2 rounded-md text-[10px] font-medium hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Contact & Follow Us */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div>
            <h4 className="text-[12px] font-bold text-[#1A1A1A] font-serif mb-3">Contact Us</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[#1A73E8]">
                <Phone className="w-3.5 h-3.5" />
                <span className="text-[9px] text-gray-600">+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A73E8]">
                <Mail className="w-3.5 h-3.5" />
                <span className="text-[9px] text-gray-600">support@arogyavrukshamsilks.com</span>
              </div>
              <div className="flex items-center gap-2 text-[#1A73E8]">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[9px] text-gray-600">Mon - Sat: 9:00 AM - 7:00 PM</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[#1A1A1A] font-serif mb-3">Follow Us</h4>
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1A73E8] hover:border-[#1A73E8]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
              <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1A73E8] hover:border-[#1A73E8]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/></svg>
              </div>
              <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1A73E8] hover:border-[#1A73E8]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.63 7.85 6.42 9.25-.09-.79-.17-2.01.04-2.88.19-.8 1.22-5.18 1.22-5.18s-.31-.62-.31-1.54c0-1.44.84-2.52 1.88-2.52.88 0 1.3.66 1.3 1.45 0 .88-.56 2.2-.85 3.42-.24 1.02.51 1.85 1.51 1.85 1.81 0 3.2-1.91 3.2-4.66 0-2.44-1.75-4.14-4.26-4.14-2.9 0-4.6 2.18-4.6 4.42 0 .88.34 1.82.76 2.33.08.1.09.19.07.29-.07.29-.23.94-.26 1.07-.04.16-.14.19-.31.11-1.15-.54-1.87-2.22-1.87-3.58 0-2.91 2.12-5.58 6.1-5.58 3.2 0 5.69 2.28 5.69 5.33 0 3.18-2 5.75-4.78 5.75-1.01 0-1.96-.52-2.28-1.14l-.62 2.37c-.22.84-.81 1.89-1.21 2.53A9.974 9.974 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/></svg>
              </div>
              <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#1A73E8] hover:border-[#1A73E8]">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Country Selector */}
        <button className="w-full flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <img src="https://flagcdn.com/w20/in.png" alt="India" className="w-5 h-3.5 rounded-sm object-cover" />
            <span className="text-[11px] font-bold text-[#1A1A1A]">India</span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </button>

        {/* Footer Bottom */}
        <div className="text-center pb-8">
          <div className="flex justify-center text-[#1A73E8] mb-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.5c0 0-4.5 3-4.5 7.5 0 2.2 1.8 4 4.5 4s4.5-1.8 4.5-4c0-4.5-4.5-7.5-4.5-7.5z"/>
              <path d="M12 14c-2.5 0-6 1.5-6 4v3h12v-3c0-2.5-3.5-4-6-4z"/>
              <circle cx="7" cy="11" r="2"/>
              <circle cx="17" cy="11" r="2"/>
            </svg>
          </div>
          <h2 className="text-[14px] font-bold text-[#1A1A1A] font-serif mb-1">Arogyavruksham Silks</h2>
          <p className="text-[9px] text-gray-500 mb-3">Timeless Weaves. Trusted by Generations.</p>
          <p className="text-[8px] text-gray-400 mb-3">&copy; {new Date().getFullYear()} Arogyavruksham Silks. All Rights Reserved.</p>
          
          <div className="flex justify-center items-center gap-2 text-[8px] text-gray-400">
            <Link href="/policies/privacy" className="hover:text-gray-600">Privacy Policy</Link>
            <span>|</span>
            <Link href="/policies/terms" className="hover:text-gray-600">Terms of Use</Link>
            <span>|</span>
            <Link href="/policies/refund" className="hover:text-gray-600">Warranty Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}
