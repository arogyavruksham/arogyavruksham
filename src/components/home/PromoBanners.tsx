'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const slideUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }
    })
  }

  return (
    <>
      {/* ─── MOBILE VIEW ─── */}
      <div className="block md:hidden bg-[#FCFBF8] px-4 py-2 overflow-hidden">
        <div className="flex gap-3.5 overflow-x-auto pb-4 pt-1 scrollbar-hide">
          {/* Banner 1 */}
          <Link href="/shop?sale=true" className="group shrink-0 w-[240px] h-[115px] rounded-[22px] bg-[#EBE6DD] border border-[#D9D1C2] p-4 relative overflow-hidden shadow-2xs flex flex-col justify-center items-center text-center">
            <div className="relative z-10">
              <h3 className="font-serif text-[19px] font-bold text-[#1E4631] leading-tight mb-1">Spring Store Sale</h3>
              <p className="text-[10px] font-extrabold text-[#235839] uppercase tracking-widest">UP TO 50% OFF</p>
            </div>
            <Image src="/images/promo/leaf_bg.png" alt="Sale" fill className="absolute object-contain opacity-25 mix-blend-multiply pointer-events-none translate-x-[60%] translate-y-[60%]" />
          </Link>

          {/* Banner 2 */}
          <Link href="/shop?category=Indoor%20Plants" className="group shrink-0 w-[240px] h-[115px] rounded-[22px] bg-[#DCE5DA] border border-[#C2CFBC] p-4 relative overflow-hidden shadow-2xs flex flex-col justify-center items-center text-center">
            <div className="relative z-10">
              <h3 className="font-serif text-[19px] font-bold text-[#1E4631] leading-tight mb-1">House Plants</h3>
              <p className="text-[10px] font-extrabold text-[#235839] uppercase tracking-widest">BRING NATURE INDOORS</p>
            </div>
            <Image src="/images/promo/house_plant.png" alt="Plants" fill className="absolute object-contain opacity-35 mix-blend-multiply pointer-events-none translate-x-[40%] translate-y-[40%]" />
          </Link>

          {/* Banner 3 */}
          <Link href="/shop?category=Pots" className="group shrink-0 w-[240px] h-[115px] rounded-[22px] bg-[#E4E6DF] border border-[#C6CABC] p-4 relative overflow-hidden shadow-2xs flex flex-col justify-center items-center text-center">
            <div className="relative z-10">
              <h3 className="font-serif text-[19px] font-bold text-[#1E4631] leading-tight mb-1">Potted In Home</h3>
              <p className="text-[10px] font-extrabold text-[#235839] uppercase tracking-widest">FLORA COLLECTION</p>
            </div>
            <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain opacity-35 mix-blend-multiply pointer-events-none translate-x-[40%] translate-y-[40%]" />
          </Link>
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <section className="hidden md:block pt-12 pb-8 bg-white overflow-hidden">
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
                <Image src="/images/promo/leaf_bg.png" alt="Leaf Background" fill className="absolute object-cover opacity-90 mix-blend-multiply pointer-events-none group-hover:scale-105 transition-transform duration-700 translate-x-[-10%] translate-y-[10%]" />
              </Link>
            </motion.div>

            {/* Banner 2: House Plants */}
            <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
              <Link href="/shop?category=Indoor%20Plants" className="group relative flex overflow-hidden border border-[#c1d1a6] bg-white h-[260px] md:h-[300px] hover:shadow-xl transition-shadow duration-500">
                <div className="relative z-10 p-8 flex flex-col pt-10">
                  <h3 className="font-serif text-3xl font-bold text-[#333] mb-2 tracking-wide">House Plants</h3>
                  <p className="text-[#888] text-lg font-serif italic">New Trending 2024</p>
                </div>
                <Image src="/images/promo/house_plant.png" alt="House Plant" fill className="absolute object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-700 origin-bottom translate-x-[20%] translate-y-[10%]" />
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
                <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-700 origin-bottom translate-x-[20%] translate-y-[10%]" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  )
}
