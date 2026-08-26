'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
  })
}

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <section className="bg-[#FAFAF7] py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8 lg:px-12">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 max-w-7xl mx-auto">
          
          {/* Banner 1: Large Featured (Spans 8 cols on desktop) */}
          <motion.div custom={0} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="md:col-span-12 lg:col-span-8 h-[400px] md:h-[480px]">
            <Link href="/shop?sale=true" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-end bg-black">
              <Image 
                src="https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=1200" 
                alt="Spring Store Sale" 
                fill 
                className="absolute inset-0 object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-in-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="relative z-10 p-8 md:p-12 flex flex-col items-start w-full text-left">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-white/20">
                  Spring Collection
                </span>
                <h2 className="font-serif text-4xl md:text-[56px] font-medium text-white leading-[1.1] mb-2 tracking-tight">
                  Mid-Season Sale
                </h2>
                <p className="font-sans text-lg md:text-xl text-white/90 font-light mb-6">Up to 50% Off Select Botanicals</p>
                <div className="inline-flex items-center text-sm font-semibold text-white tracking-[0.1em] uppercase group-hover:translate-x-2 transition-transform duration-300">
                  Shop Now <span className="ml-2">→</span>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Banner 2 & 3 wrapper for Desktop right side */}
          <div className="md:col-span-12 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 lg:gap-8 h-full">
            
            {/* Banner 2: Trending */}
            <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="h-[300px] md:h-[400px] lg:h-[224px]">
              <Link href="/shop?category=Indoor%20Plants" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-center p-8 bg-[#1E4631]">
                <Image 
                  src="https://images.unsplash.com/photo-1597405230303-3ea76b91c0d4?auto=format&fit=crop&q=80&w=800" 
                  alt="House Plants" 
                  fill 
                  className="absolute inset-0 object-cover opacity-40 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 ease-in-out mix-blend-overlay" 
                />
                <div className="relative z-10">
                  <p className="text-[#F4F6F4]/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Trending 2024</p>
                  <h3 className="font-serif text-3xl font-medium text-white leading-tight mb-4">Indoor<br/>Oasis</h3>
                  <div className="w-10 h-10 rounded-full bg-white text-[#1E4631] flex items-center justify-center group-hover:bg-[#D27D56] group-hover:text-white transition-colors duration-300">
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Banner 3: New Arrivals */}
            <motion.div custom={2} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="h-[300px] md:h-[400px] lg:h-[224px]">
              <Link href="/shop?category=Pots" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-center p-8 bg-[#D27D56]">
                <Image 
                  src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800" 
                  alt="Potted In Home" 
                  fill 
                  className="absolute inset-0 object-cover opacity-50 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700 ease-in-out mix-blend-overlay" 
                />
                <div className="relative z-10">
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Flora Collection</p>
                  <h3 className="font-serif text-3xl font-medium text-white leading-tight mb-4">Potted In<br/>Home</h3>
                  <div className="w-10 h-10 rounded-full bg-white text-[#D27D56] flex items-center justify-center group-hover:bg-[#1E4631] group-hover:text-white transition-colors duration-300">
                    <span className="text-lg">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
            
          </div>

        </div>
      </div>
    </section>
  )
}
