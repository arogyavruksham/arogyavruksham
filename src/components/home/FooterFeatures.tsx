'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Truck, Headphones, ShieldCheck } from 'lucide-react'

export function FooterFeatures() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1, y: 0,
      transition: { delay: i * 0.1, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const }
    })
  }

  return (
    <>
      {/* ─── MOBILE VIEW (Feature Cards) ─── */}
      <section className="block md:hidden bg-white py-12 px-6">
        <div className="flex flex-col gap-4">
          
          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <Truck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">Free Shipping</h4>
              <p className="text-gray-500 text-[13px]">On orders over ₹1999</p>
            </div>
          </div>

          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <Headphones className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">24/7 Support</h4>
              <p className="text-gray-500 text-[13px]">Expert plant care advice</p>
            </div>
          </div>

          <div className="bg-[#FAFAF7] rounded-[24px] p-6 border border-[#F4F6F4] flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#1E4631] shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="font-serif font-medium text-[18px] text-[#1a1a1a] leading-tight mb-1">Guarantee</h4>
              <p className="text-gray-500 text-[13px]">30-day healthy plant promise</p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── DESKTOP VIEW ─── */}
      <section className="hidden md:block py-20 bg-white border-t border-[#F4F6F4]" ref={ref}>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative">
            
            {/* Divider lines between items */}
            <div className="hidden md:block absolute top-1/2 left-1/3 -translate-y-1/2 w-[1px] h-20 bg-[#F4F6F4]"></div>
            <div className="hidden md:block absolute top-1/2 left-2/3 -translate-y-1/2 w-[1px] h-20 bg-[#F4F6F4]"></div>

            {/* Feature 1 */}
            <motion.div custom={0} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-[#FAFAF7] rounded-full flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-[#1E4631] transition-all duration-300">
                <Truck className="w-8 h-8 text-[#1E4631] stroke-[1.5] group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="font-serif text-[20px] font-medium text-[#1a1a1a] mb-2">Free Delivery</h4>
              <p className="text-gray-500 text-[14px] max-w-[200px]">Complimentary shipping on all orders over ₹1999</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div custom={1} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-[#FAFAF7] rounded-full flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-[#1E4631] transition-all duration-300">
                <Headphones className="w-8 h-8 text-[#1E4631] stroke-[1.5] group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="font-serif text-[20px] font-medium text-[#1a1a1a] mb-2">Expert Support</h4>
              <p className="text-gray-500 text-[14px] max-w-[200px]">24/7 dedicated advice from our botanists</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div custom={2} variants={featureVariants} initial="hidden" animate={inView ? "visible" : "hidden"} className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-[#FAFAF7] rounded-full flex items-center justify-center mb-6 group-hover:-translate-y-2 group-hover:bg-[#1E4631] transition-all duration-300">
                <ShieldCheck className="w-8 h-8 text-[#1E4631] stroke-[1.5] group-hover:text-white transition-colors duration-300" />
              </div>
              <h4 className="font-serif text-[20px] font-medium text-[#1a1a1a] mb-2">Live Guarantee</h4>
              <p className="text-gray-500 text-[14px] max-w-[200px]">30-day money back if your plant doesn't thrive</p>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  )
}
