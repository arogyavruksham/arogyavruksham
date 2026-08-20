'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { MobileHomeHeader } from './MobileHomeHeader'

export function DualHeroBanners() {
  return (
    <>
      <div className="block md:hidden bg-[#FCFBF8]">
        <div className="p-4 pt-4 pb-3">
          <MobileHomeHeader />
        </div>
        <div className="relative w-full h-[85vh] min-h-[600px] flex flex-col justify-end p-6 pb-12 overflow-hidden">
          <Image 
            src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=1200" 
            alt="Premium Indoor Plants"
            fill
            priority
            className="absolute inset-0 object-cover z-0" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A10]/90 via-[#0A1A10]/40 to-transparent z-10" />
          
          <div className="relative z-20 flex flex-col items-start w-full">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#A4E4BA] mb-3">Indoor Collection</p>
            <h1 className="text-4xl font-serif font-bold text-white leading-[1.1] mb-4 tracking-tight">
              Breathe Life Into <br/><span className="italic font-light">Your Space</span>
            </h1>
            <p className="text-sm text-white/80 leading-relaxed mb-8 max-w-[280px]">
              Handpicked indoor plants for every room in your house. Delivered fresh to your doorstep.
            </p>
            <Link 
              href="/shop?category=Indoor%20Plants"
              className="bg-white hover:bg-gray-100 text-[#11311F] font-bold text-xs tracking-wider uppercase px-8 py-4 rounded-full text-center transition-transform active:scale-95"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      <section className="hidden md:flex relative w-full h-screen min-h-[700px] bg-[#FCFBF8] items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 flex items-center h-full pt-16">
          <div className="w-1/2 pr-12 lg:pr-24 z-10 relative">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#11311F]/60 mb-6"
            >
              Indoor Collection
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl lg:text-[80px] font-serif text-[#11311F] leading-[1.05] tracking-tight mb-8"
            >
              Breathe Life <br/>Into <span className="italic font-light text-[#2D6A4F]">Your Space</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-gray-600 leading-relaxed max-w-[26rem] mb-12"
            >
              Handpicked indoor plants for every room in your house. Delivered fresh to your doorstep.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link 
                href="/shop?category=Indoor%20Plants"
                className="inline-flex items-center justify-center bg-[#11311F] hover:bg-black text-white font-bold text-[13px] tracking-widest uppercase px-12 py-5 rounded-full transition-transform active:scale-95 shadow-xl shadow-[#11311F]/10"
              >
                Shop Collection
              </Link>
            </motion.div>
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-[50%] h-full">
            <motion.div 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full h-full overflow-hidden"
            >
              <Image 
                src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=1600" 
                alt="Premium Indoor Plants"
                fill
                priority
                className="object-cover object-[70%_50%]" 
              />
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FCFBF8] to-transparent z-10" />
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
