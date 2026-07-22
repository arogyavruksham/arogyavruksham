'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
    })
  }

  return (
    <section className="pt-12 pb-8 bg-white overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" ref={ref}>
          
          {/* Banner 1: SALE */}
          <motion.div custom={0} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
            <Link href="/shop?sale=true" className="group relative flex overflow-hidden border border-[#e5dec5] bg-white h-[260px] md:h-[300px] hover:shadow-xl transition-shadow duration-500">
              <div className="relative z-10 p-8 flex flex-col justify-center items-center w-full text-center mt-4">
                <h2 className="font-serif text-[42px] font-normal tracking-wide text-[#222] leading-none mb-2">S A L E</h2>
                <p className="text-[#666] text-sm uppercase tracking-widest mb-2">SPRING STORE</p>
                <p className="font-serif text-5xl font-light text-[#888] tracking-widest"><span className="text-[32px] align-top relative top-1 mr-1">50%</span>OFF</p>
              </div>
              <img src="/images/promo/leaf_bg.png" alt="Leaf Background" className="absolute -bottom-10 -left-10 w-[120%] h-[120%] object-cover opacity-90 mix-blend-multiply pointer-events-none group-hover:scale-105 transition-transform duration-700" />
            </Link>
          </motion.div>

          {/* Banner 2: House Plants */}
          <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
            <Link href="/shop?category=Indoor%20Plants" className="group relative flex overflow-hidden border border-[#c1d1a6] bg-white h-[260px] md:h-[300px] hover:shadow-xl transition-shadow duration-500">
              <div className="relative z-10 p-8 flex flex-col pt-10">
                <h3 className="font-serif text-3xl font-bold text-[#333] mb-2 tracking-wide">House Plants</h3>
                <p className="text-[#888] text-lg font-serif italic">New Trending 2024</p>
              </div>
              <img src="/images/promo/house_plant.png" alt="House Plant" className="absolute bottom-0 right-0 h-[85%] object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-700 origin-bottom" />
            </Link>
          </motion.div>

          {/* Banner 3: Potted In Home */}
          <motion.div custom={2} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
            <Link href="/shop?category=Pots" className="group relative flex overflow-hidden border border-[#c1d1a6] bg-[#f8f9f6] h-[260px] md:h-[300px] hover:shadow-xl transition-shadow duration-500">
              <div className="relative z-10 p-8 pt-12 flex flex-col w-[60%]">
                <p className="text-[#444] text-xs font-bold uppercase tracking-widest mb-4 leading-relaxed">POTTED IN HOME</p>
                <div className="flex flex-col">
                  <span className="font-serif text-5xl font-light text-[#555] leading-none mb-2"><span className="text-3xl align-top mr-1">50%</span></span>
                  <span className="font-serif text-[40px] font-light text-[#888] leading-none tracking-widest">OFF</span>
                </div>
              </div>
              <img src="/images/promo/cactus.png" alt="Cactus" className="absolute bottom-0 right-0 h-[90%] object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-700 origin-bottom" />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
