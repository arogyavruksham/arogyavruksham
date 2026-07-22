'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export function AnnouncementBar() {
  return (
    <motion.div 
      initial={{ height: 0, opacity: 0 }} 
      animate={{ height: 'auto', opacity: 1 }} 
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-[#689f38] text-white text-center py-2 px-4 text-[12px] font-bold tracking-widest uppercase overflow-hidden hidden md:block"
    >
      <div className="flex items-center justify-center gap-2">
        <span>Free Shipping Every Day, Every Order Over ₹999</span>
        <span className="opacity-50">|</span>
        <Link href="/shop" className="underline hover:text-white/80 transition-colors">Shop Now</Link>
      </div>
    </motion.div>
  )
}
