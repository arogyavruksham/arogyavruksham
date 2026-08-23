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
          <Link href="/shop?sale=true" className="group shrink-0 w-[260px] h-[130px] bg-[#FAFAFA] relative overflow-hidden flex flex-col justify-center items-start text-left px-6">
            <div className="relative z-10">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-2">Up to 50% Off</p>
              <h3 className="font-serif text-[22px] font-medium text-black leading-tight">Spring Sale</h3>
            </div>
            <Image src="/images/promo/leaf_bg.png" alt="Sale" fill className="absolute object-contain opacity-20 pointer-events-none translate-x-[50%] translate-y-[40%]" />
          </Link>

          {/* Banner 2 */}
          <Link href="/shop?category=Indoor%20Plants" className="group shrink-0 w-[260px] h-[130px] bg-[#FAFAFA] relative overflow-hidden flex flex-col justify-center items-start text-left px-6">
            <div className="relative z-10">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-2">Bring Nature Indoors</p>
              <h3 className="font-serif text-[22px] font-medium text-black leading-tight">House Plants</h3>
            </div>
            <Image src="/images/promo/house_plant.png" alt="Plants" fill className="absolute object-contain opacity-20 pointer-events-none translate-x-[40%] translate-y-[30%]" />
          </Link>

          {/* Banner 3 */}
          <Link href="/shop?category=Pots" className="group shrink-0 w-[260px] h-[130px] bg-[#FAFAFA] relative overflow-hidden flex flex-col justify-center items-start text-left px-6">
            <div className="relative z-10">
              <p className="text-[9px] font-semibold text-gray-500 uppercase tracking-[0.2em] mb-2">Flora Collection</p>
              <h3 className="font-serif text-[22px] font-medium text-black leading-tight">Potted In Home</h3>
            </div>
            <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain opacity-20 pointer-events-none translate-x-[40%] translate-y-[30%]" />
          </Link>
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <section className="hidden md:block pt-12 pb-8 bg-white overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8" ref={ref}>
            
            {/* Banner 1: SALE */}
            <motion.div custom={0} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
              <Link href="/shop?sale=true" className="group relative flex flex-col overflow-hidden bg-[#FAFAFA] h-[320px] hover:bg-gray-50 transition-colors duration-500">
                <div className="relative z-10 p-10 flex flex-col items-start w-full text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em] mb-4">Spring Store</p>
                  <h2 className="font-serif text-[48px] font-medium text-black leading-none mb-4">Sale</h2>
                  <p className="font-serif text-3xl font-light text-gray-400">50% Off</p>
                </div>
                <Image src="/images/promo/leaf_bg.png" alt="Leaf Background" fill className="absolute object-cover opacity-15 pointer-events-none group-hover:scale-105 transition-transform duration-700 translate-x-[30%] translate-y-[20%]" />
              </Link>
            </motion.div>

            {/* Banner 2: House Plants */}
            <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
              <Link href="/shop?category=Indoor%20Plants" className="group relative flex flex-col overflow-hidden bg-[#FAFAFA] h-[320px] hover:bg-gray-50 transition-colors duration-500">
                <div className="relative z-10 p-10 flex flex-col items-start w-full text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em] mb-4">Trending 2024</p>
                  <h3 className="font-serif text-[36px] font-medium text-black leading-none mb-4">House Plants</h3>
                </div>
                <Image src="/images/promo/house_plant.png" alt="House Plant" fill className="absolute object-contain opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 translate-x-[20%] translate-y-[10%]" />
              </Link>
            </motion.div>

            {/* Banner 3: Potted In Home */}
            <motion.div custom={2} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp}>
              <Link href="/shop?category=Pots" className="group relative flex flex-col overflow-hidden bg-[#FAFAFA] h-[320px] hover:bg-gray-50 transition-colors duration-500">
                <div className="relative z-10 p-10 flex flex-col items-start w-full text-left">
                  <p className="text-gray-500 text-xs font-medium uppercase tracking-[0.2em] mb-4">Flora Collection</p>
                  <h3 className="font-serif text-[36px] font-medium text-black leading-none mb-4">Potted In Home</h3>
                  <p className="font-serif text-3xl font-light text-gray-400">New</p>
                </div>
                <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 translate-x-[20%] translate-y-[10%]" />
              </Link>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  )
}
