'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const slideUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { duration: 0.7, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] as const }
    })
  }

  return (
    <>
      {/* ─── MOBILE VIEW ─── */}
      <div className="block md:hidden bg-[#FCFBF8] px-4 py-8 overflow-hidden">
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-hide snap-x">
          {/* Banner 1 */}
          <Link href="/shop?sale=true" className="group snap-start shrink-0 w-[280px] h-[320px] rounded-3xl bg-[#E3E8E1] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <span className="bg-white/60 backdrop-blur-md rounded-full px-3 py-1.5 font-bold text-[#11311F] text-[10px] tracking-widest uppercase mb-3 inline-block">Up to 50% Off</span>
              <h2 className="font-serif text-3xl font-medium text-[#11311F] leading-none mb-2">Spring<br/><span className="italic text-[#2D6A4F]">Sale</span></h2>
            </div>
            <Image src="/images/promo/leaf_bg.png" alt="Sale" fill className="absolute object-cover opacity-80 mix-blend-multiply pointer-events-none translate-x-[20%] translate-y-[20%] object-bottom right-0 bottom-0 w-auto h-[70%]" />
          </Link>

          {/* Banner 2 */}
          <Link href="/shop?category=Indoor%20Plants" className="group snap-start shrink-0 w-[240px] h-[320px] rounded-3xl bg-[#F6F4ED] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-medium text-[#11311F] leading-tight mb-1">Indoor<br/>Plants</h3>
              <p className="text-[#11311F]/60 text-[11px] font-bold uppercase tracking-wider">Breathe Easy</p>
            </div>
            <Image src="/images/promo/house_plant.png" alt="Plants" fill className="absolute object-contain opacity-90 mix-blend-multiply pointer-events-none translate-x-[20%] translate-y-[30%] w-auto h-[60%] right-0 bottom-0" />
          </Link>

          {/* Banner 3 */}
          <Link href="/shop?category=Pots" className="group snap-start shrink-0 w-[240px] h-[320px] rounded-3xl bg-[#E9E4DB] p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
              <h3 className="font-serif text-2xl font-medium text-[#11311F] leading-tight mb-1">Premium<br/>Pots</h3>
              <p className="text-[#11311F]/60 text-[11px] font-bold uppercase tracking-wider">Artisan Crafted</p>
            </div>
            <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain opacity-90 mix-blend-multiply pointer-events-none translate-x-[20%] translate-y-[30%] w-auto h-[60%] right-0 bottom-0" />
          </Link>
        </div>
      </div>

      {/* ─── DESKTOP VIEW (BENTO GRID) ─── */}
      <section className="hidden md:block pt-24 pb-16 bg-[#FCFBF8] overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
          <div className="flex flex-col md:flex-row gap-6 h-auto md:h-[550px]" ref={ref}>
            
            {/* Banner 1: SALE (Large) */}
            <motion.div custom={0} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="flex-[55%] h-[350px] md:h-full">
              <Link href="/shop?sale=true" className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-[#E3E8E1] h-full hover:shadow-2xl transition-all duration-500 p-12 lg:p-16">
                <div className="relative z-10 w-full flex justify-between items-start">
                  <div>
                    <h2 className="font-serif text-5xl lg:text-7xl font-medium text-[#11311F] leading-[1.1] mb-4 tracking-tight">Spring<br/><span className="italic font-light text-[#2D6A4F]">Sale</span></h2>
                    <p className="font-sans text-[#11311F]/70 text-lg max-w-[220px]">Bring nature indoors with exclusive discounts on premium plants.</p>
                  </div>
                  <div className="bg-white/60 backdrop-blur-md rounded-full px-5 py-2">
                    <span className="font-bold text-[#11311F] text-[11px] tracking-widest uppercase">Up to 50% Off</span>
                  </div>
                </div>
                <div className="relative z-10 mt-auto">
                   <span className="inline-flex items-center text-[13px] font-bold tracking-widest uppercase text-[#11311F] group-hover:pl-2 transition-all">Shop Sale <ArrowRight className="w-4 h-4 ml-2" /></span>
                </div>
                <Image src="/images/promo/leaf_bg.png" alt="Leaf Background" fill className="absolute object-cover opacity-80 mix-blend-multiply pointer-events-none group-hover:scale-105 transition-transform duration-1000 ease-out translate-x-[15%] translate-y-[15%] object-bottom right-0 bottom-0 w-auto h-[80%]" />
              </Link>
            </motion.div>

            <div className="flex flex-col flex-[45%] gap-6 h-full">
              {/* Banner 2: House Plants */}
              <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="flex-1 h-[250px] md:h-auto">
                <Link href="/shop?category=Indoor%20Plants" className="group relative flex flex-col justify-center overflow-hidden rounded-[2rem] bg-[#F6F4ED] h-full hover:shadow-2xl transition-all duration-500 p-10">
                  <div className="relative z-10 max-w-[60%]">
                    <h3 className="font-serif text-3xl lg:text-4xl font-medium text-[#11311F] mb-3 tracking-tight">Indoor Plants</h3>
                    <p className="text-[#11311F]/60 text-[11px] font-bold tracking-widest uppercase">Breathe easy at home</p>
                  </div>
                  <Image src="/images/promo/house_plant.png" alt="House Plant" fill className="absolute object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-1000 ease-out origin-bottom translate-x-[30%] translate-y-[20%] right-0 bottom-0 w-[55%] h-[85%]" />
                </Link>
              </motion.div>

              {/* Banner 3: Potted In Home */}
              <motion.div custom={2} initial="hidden" animate={inView ? "visible" : "hidden"} variants={slideUp} className="flex-1 h-[250px] md:h-auto">
                <Link href="/shop?category=Pots" className="group relative flex flex-col justify-center overflow-hidden rounded-[2rem] bg-[#E9E4DB] h-full hover:shadow-2xl transition-all duration-500 p-10">
                  <div className="relative z-10 max-w-[60%]">
                    <h3 className="font-serif text-3xl lg:text-4xl font-medium text-[#11311F] mb-3 tracking-tight">Premium Pots</h3>
                    <p className="text-[#11311F]/60 text-[11px] font-bold tracking-widest uppercase">Artisan crafted vessels</p>
                  </div>
                  <Image src="/images/promo/cactus.png" alt="Cactus" fill className="absolute object-contain mix-blend-multiply group-hover:-translate-y-2 transition-transform duration-1000 ease-out origin-bottom translate-x-[30%] translate-y-[15%] right-0 bottom-0 w-[55%] h-[90%]" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
