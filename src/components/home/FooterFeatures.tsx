'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Truck, PhoneCall, RefreshCw } from 'lucide-react'

export function FooterFeatures() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const featureVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' }
    })
  }

  return (
    <section className="py-20 bg-white border-t border-[#f0f0f0]" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 divide-y md:divide-y-0 md:divide-x divide-[#f0f0f0]">
          
          {/* Feature 1 */}
          <motion.div custom={0} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex items-start justify-center md:justify-start gap-6 pt-10 md:pt-0">
            <Truck className="w-10 h-10 text-[#689f38] stroke-[1px] shrink-0" />
            <div className="flex flex-col">
              <h4 className="font-bold text-[12px] text-[#222] uppercase tracking-widest leading-relaxed mb-2">Free Shipping<br/>Every Day, Every Order</h4>
              <p className="text-[#888] text-[13px]">All order over ₹999</p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div custom={1} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex items-start justify-center md:justify-start gap-6 pt-10 md:pt-0 md:pl-16">
            <PhoneCall className="w-10 h-10 text-[#689f38] stroke-[1px] shrink-0" />
            <div className="flex flex-col">
              <h4 className="font-bold text-[12px] text-[#222] uppercase tracking-widest leading-relaxed mb-2">24/7 Dedicated Support</h4>
              <p className="text-[#888] text-[13px]">+91 98765 43210</p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div custom={2} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex items-start justify-center md:justify-start gap-6 pt-10 md:pt-0 md:pl-16">
            <RefreshCw className="w-10 h-10 text-[#689f38] stroke-[1px] shrink-0" />
            <div className="flex flex-col">
              <h4 className="font-bold text-[12px] text-[#222] uppercase tracking-widest leading-relaxed mb-2">Money Back</h4>
              <p className="text-[#888] text-[13px]">If the item didn't suit you</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
