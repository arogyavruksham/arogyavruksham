'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TrendingBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section className="py-24 bg-white overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        <div className="relative flex flex-col md:flex-row items-center h-auto md:h-[500px]">
          
          {/* Background Split */}
          <div className="absolute inset-0 flex">
            <div className="w-[55%] h-full bg-[#f8f9fb]"></div>
            <div className="w-[45%] h-full bg-white"></div>
          </div>

          {/* Plant Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative z-10 w-full md:w-[50%] h-[400px] md:h-[600px] flex items-end justify-center md:justify-end pr-0 md:pr-12 pt-12 md:pt-0"
          >
            {/* 50% OFF Badge */}
            <div className="absolute top-20 left-20 md:left-32 bg-[#ffb156] text-white rounded-xl p-4 flex flex-col items-center justify-center w-24 h-24 shadow-sm z-20">
              <span className="font-serif text-2xl font-light leading-none">50%</span>
              <span className="font-serif text-xl font-light tracking-widest leading-none mt-1">OFF</span>
            </div>

            <img 
              src="/images/promo/trending_banner.png" 
              alt="Trending Plant" 
              className="w-auto h-[120%] max-h-[700px] object-contain mix-blend-multiply origin-bottom transform translate-y-12"
            />
          </motion.div>

          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="relative z-10 w-full md:w-[50%] pl-8 md:pl-16 pr-8 pt-12 md:pt-0"
          >
            <p className="font-serif italic text-[#78b144] text-[15px] mb-2">Trending Plant 2024</p>
            <h2 className="font-sans font-bold text-[36px] md:text-[42px] text-[#111] leading-[1.1] mb-6">
              Elegant and tolerant plant
            </h2>
            <p className="text-[#666] text-[14px] leading-[1.8] max-w-xl mb-8">
              We are only beginning to understand the impact indoor air quality has on our mental health and work performance, but so far, the introduction of indoor plants to improve indoor air and reduce pollution points to positive outcomes. <br/><br/>
              It's true when we say plants make people happy.
            </p>
            <Link href="/shop" className="text-[#78b144] text-[13px] font-bold tracking-widest uppercase hover:text-[#5b8a30] transition-colors">
              SHOP NOW
            </Link>

            {/* Navigation Arrows */}
            <div className="absolute -bottom-24 right-8 flex">
              <button className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#689f38] transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-14 h-14 bg-black text-white border-l border-white/20 flex items-center justify-center hover:bg-[#689f38] transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
