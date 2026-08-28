'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export function FooterFeatures() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe')
      }

      setStatus('success')
      setMessage(data.message || 'Subscribed successfully!')
      setEmail('')
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setMessage('')
        setStatus('idle')
      }, 3000)
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <footer className="w-full bg-white pt-10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16">
        
        {/* Newsletter Banner */}
        <div className="w-full bg-[#f8f9f8] py-12 px-10 md:px-20 flex flex-col md:flex-row items-center justify-between gap-8 mb-20">
          <h2 className="font-sans text-[32px] font-bold text-[#166534] whitespace-nowrap">
            Sign Up To Our Newsletter
          </h2>
          
          <div className="w-full max-w-[500px] flex flex-col gap-2">
            <form onSubmit={handleSubscribe} className="flex w-full h-[50px] bg-white border border-gray-200">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Your Email Address"
                className="flex-1 h-full px-5 outline-none text-[14px] text-gray-700 bg-transparent"
                required
                disabled={status === 'loading'}
              />
              <button 
                type="submit"
                disabled={status === 'loading'}
                className="h-full px-8 flex items-center justify-center gap-2 bg-[#166534] text-white font-medium text-[14px] hover:bg-[#155a2d] transition-colors whitespace-nowrap disabled:opacity-70"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" />}
                Subscribe
              </button>
            </form>
            {message && (
              <p className={`text-[13px] font-semibold ${status === 'error' ? 'text-red-500' : 'text-green-700'}`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-16 mb-20">
          {/* Col 1 */}
          <div className="flex flex-col gap-6">
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
            <p className="text-[13px] text-gray-500 leading-relaxed font-sans">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed purus dolor, mattis et blandit vitae, luctus id enim. Fusce id ultrices tortor. Sed gravida ligula eu fermentum venenatis. Nunc tincidunt ligula sed volutpat placerat. Cras ultrices elementum efficitur. Curabitur ullamcorper neque condimentum, eleifend lectus.
            </p>
          </div>

          {/* Col 2 */}
          <div className="flex flex-col gap-5 pt-2">
            <h3 className="font-bold text-[16px] text-gray-900">Product</h3>
            <div className="flex flex-col gap-4 text-[14px] text-gray-500">
              <Link href="#" className="hover:text-[#166534]">New Arrivals</Link>
              <Link href="#" className="hover:text-[#166534]">Best Selling</Link>
              <Link href="#" className="hover:text-[#166534]">Home Decor</Link>
              <Link href="#" className="hover:text-[#166534]">Kitchen Set</Link>
            </div>
          </div>

          {/* Col 3 */}
          <div className="flex flex-col gap-5 pt-2">
            <h3 className="font-bold text-[16px] text-gray-900">Services</h3>
            <div className="flex flex-col gap-4 text-[14px] text-gray-500">
              <Link href="#" className="hover:text-[#166534]">Catalog</Link>
              <Link href="#" className="hover:text-[#166534]">Blog</Link>
              <Link href="#" className="hover:text-[#166534]">FaQ</Link>
              <Link href="#" className="hover:text-[#166534]">Pricing</Link>
            </div>
          </div>

          {/* Col 4 */}
          <div className="flex flex-col gap-5 pt-2">
            <h3 className="font-bold text-[16px] text-gray-900">Follow Us</h3>
            <div className="flex flex-col gap-4 text-[14px] text-gray-500">
              <Link href="#" className="hover:text-[#166534]">Facebook</Link>
              <Link href="#" className="hover:text-[#166534]">Instagram</Link>
              <Link href="#" className="hover:text-[#166534]">Twitter</Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full text-center py-6 text-[12px] text-gray-400 font-medium">
          Copyright © 2023 All Right Reserved
        </div>
        
      </div>
    </footer>
  )
}
