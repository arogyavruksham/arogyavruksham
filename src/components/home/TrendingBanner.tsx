'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Check, Leaf } from 'lucide-react'

const benefits = [
  'Improve air quality by removing toxins and increasing oxygen levels naturally.',
  'Reduce stress and anxiety — studies show indoor plants lower cortisol by up to 25%.',
  'Boost productivity and creativity in your workspace with living greenery.',
]

export function TrendingBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <>
      {/* ─── MOBILE VIEW (kept simple) ─── */}
      <section className="block md:hidden bg-[#1E4631] py-12 px-6">
        <div className="text-center mb-8">
          <h2 className="font-serif text-[28px] font-medium text-white leading-tight mb-4">
            The Benefits Of Indoor Plants
          </h2>
          <p className="text-white/70 text-sm leading-relaxed">
            Discover why millions of people are bringing nature indoors.
          </p>
        </div>
        <div className="space-y-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-white/80 text-[13px] leading-relaxed">{b}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-white text-[#1E4631] font-semibold text-[11px] tracking-[0.15em] uppercase px-8 py-3.5 rounded-full"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* ─── DESKTOP VIEW — Benefits Banner ─── */}
      <section className="hidden md:block py-0 bg-white overflow-hidden" ref={ref}>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, ease: 'easeOut' as const }}
            className="relative bg-[#1E4631] rounded-[40px] flex items-center min-h-[400px] overflow-hidden"
          >
            {/* Decorative leaf */}
            <div className="absolute top-0 right-0 opacity-[0.04] pointer-events-none">
              <Leaf size={500} className="text-white" />
            </div>

            {/* Left: Heading */}
            <div className="w-[45%] p-16 lg:p-20 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-10 h-[2px] bg-[#D27D56]"></span>
                <span className="text-[#D27D56] text-[11px] font-bold tracking-[0.25em] uppercase">
                  Why Plants?
                </span>
              </div>
              <h2 className="font-serif text-[40px] lg:text-[52px] font-medium text-white leading-[1.1] mb-6">
                The Benefits<br />Of Indoor Plants
              </h2>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-white text-[#1E4631] font-semibold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-[#F4F6F4] transition-colors shadow-lg"
              >
                Start Shopping →
              </Link>
            </div>

            {/* Right: Benefits List */}
            <div className="w-[55%] p-16 lg:p-20 relative z-10">
              <div className="space-y-8">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.6 }}
                    className="flex items-start gap-5"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-[#D27D56]" />
                    </div>
                    <p className="text-white/80 text-[15px] leading-relaxed pt-2">
                      {benefit}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </section>
    </>
  )
}
