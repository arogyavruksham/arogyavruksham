'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Truck, Headphones, ShieldCheck } from 'lucide-react'
import { useHomepageImages } from '@/lib/homepageImages'
import { NewsletterSubscribeForm } from '@/components/admin/NewsletterSubscribeForm'

export function FooterFeatures() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const images = useHomepageImages()

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const }
    })
  }

  return (
    <>
      {/* ─── MOBILE VIEW (Feature Cards — PRESERVED) ─── */}
      <section className="block md:hidden bg-white py-12 px-6">
        <div className="flex flex-col gap-4">

          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">Free Shipping</h4>
              <p className="text-gray-500 text-[13px]">On orders over ₹1999</p>
            </div>
          </div>

          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <Headphones className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">24/7 Support</h4>
              <p className="text-gray-500 text-[13px]">Expert plant care advice</p>
            </div>
          </div>

          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">Guarantee</h4>
              <p className="text-gray-500 text-[13px]">30-day healthy plant promise</p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── DESKTOP VIEW — Newsletter Subscribe Banner ─── */}
      <section className="hidden md:block py-20 bg-[#F5F5F0]" ref={ref}>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative flex items-center justify-center"
          >
            {/* Decorative left image */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-[20px] overflow-hidden hidden lg:block">
              <img
                src={images.newsletter_leaf}
                alt="Plant decoration"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Center content */}
            <div className="text-center max-w-xl mx-auto relative z-10">
              <h2 className="font-serif text-[36px] lg:text-[44px] font-medium text-[#1a1a1a] leading-[1.15] mb-8">
                Subscribe Newsletter &amp; Get Plant News
              </h2>
              <div className="max-w-md mx-auto">
                <NewsletterSubscribeForm source="homepage_banner" />
              </div>
            </div>

            {/* Decorative right image */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[140px] h-[140px] rounded-[20px] overflow-hidden hidden lg:block">
              <img
                src={images.newsletter_person}
                alt="Person with plant"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
