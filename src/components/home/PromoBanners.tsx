'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Loader2, Heart, ShoppingBag } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'

/* ─── Mobile Promo Banners (PRESERVED EXACTLY) ─── */
const mobileSlideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] as const }
  })
}

function MobilePromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-10%" })

  return (
    <section className="block md:hidden bg-[#FAFAF7] py-16">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid grid-cols-1 gap-6 max-w-7xl mx-auto">
          <motion.div custom={0} initial="hidden" animate={inView ? "visible" : "hidden"} variants={mobileSlideUp} className="h-[400px]">
            <Link href="/shop?sale=true" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-end bg-black">
              <Image src="https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&q=80&w=1200" alt="Spring Store Sale" fill className="absolute inset-0 object-cover opacity-80 group-hover:scale-105 group-hover:opacity-60 transition-all duration-700 ease-in-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="relative z-10 p-8 flex flex-col items-start w-full text-left">
                <span className="inline-block bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-4 border border-white/20">Spring Collection</span>
                <h2 className="font-serif text-4xl font-medium text-white leading-[1.1] mb-2 tracking-tight">Mid-Season Sale</h2>
                <p className="font-sans text-lg text-white/90 font-light mb-6">Up to 50% Off Select Botanicals</p>
                <div className="inline-flex items-center text-sm font-semibold text-white tracking-[0.1em] uppercase group-hover:translate-x-2 transition-transform duration-300">Shop Now <span className="ml-2">→</span></div>
              </div>
            </Link>
          </motion.div>
          <div className="grid grid-cols-2 gap-6">
            <motion.div custom={1} initial="hidden" animate={inView ? "visible" : "hidden"} variants={mobileSlideUp} className="h-[300px]">
              <Link href="/shop?category=Indoor%20Plants" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-center p-8 bg-[#1E4631]">
                <Image src="https://images.unsplash.com/photo-1597405230303-3ea76b91c0d4?auto=format&fit=crop&q=80&w=800" alt="House Plants" fill className="absolute inset-0 object-cover opacity-40 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700 ease-in-out mix-blend-overlay" />
                <div className="relative z-10">
                  <p className="text-[#F4F6F4]/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Trending 2024</p>
                  <h3 className="font-serif text-3xl font-medium text-white leading-tight mb-4">Indoor<br/>Oasis</h3>
                  <div className="w-10 h-10 rounded-full bg-white text-[#1E4631] flex items-center justify-center group-hover:bg-[#D27D56] group-hover:text-white transition-colors duration-300"><span className="text-lg">→</span></div>
                </div>
              </Link>
            </motion.div>
            <motion.div custom={2} initial="hidden" animate={inView ? "visible" : "hidden"} variants={mobileSlideUp} className="h-[300px]">
              <Link href="/shop?category=Pots" className="group relative w-full h-full rounded-[32px] overflow-hidden flex flex-col justify-center p-8 bg-[#D27D56]">
                <Image src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800" alt="Potted In Home" fill className="absolute inset-0 object-cover opacity-50 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700 ease-in-out mix-blend-overlay" />
                <div className="relative z-10">
                  <p className="text-white/80 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Flora Collection</p>
                  <h3 className="font-serif text-3xl font-medium text-white leading-tight mb-4">Potted In<br/>Home</h3>
                  <div className="w-10 h-10 rounded-full bg-white text-[#D27D56] flex items-center justify-center group-hover:bg-[#1E4631] group-hover:text-white transition-colors duration-300"><span className="text-lg">→</span></div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Desktop: Featured Plant Product Grid ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: 'easeOut' as const }
  })
}

function FeaturedCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCartStore()

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="h-full"
    >
      <div className="group flex flex-col h-full bg-white rounded-[20px] p-4 border border-gray-100 hover:shadow-[0_12px_40px_-8px_rgba(0,0,0,0.08)] transition-all duration-300">
        {/* Image */}
        <Link
          href={`/shop/${product.id}`}
          className="relative bg-[#FAFAF7] rounded-[16px] aspect-square flex items-center justify-center p-6 mb-4 overflow-hidden"
        >
          <motion.img
            src={product.image_url}
            alt={product.title}
            onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop' }}
            className="w-[80%] h-[80%] object-contain mix-blend-multiply origin-bottom"
            animate={{ scale: hovered ? 1.08 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </Link>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-end px-1">
          <Link href={`/shop/${product.id}`}>
            <h4 className="text-[15px] font-bold text-[#222] mb-1 leading-tight group-hover:text-[#1E4631] transition-colors truncate">
              {product.title}
            </h4>
          </Link>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {product.original_price && (
                <span className="text-[12px] text-gray-400 line-through">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[15px] font-black text-[#1E4631]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </div>
            <button
              onClick={(e) => { e.preventDefault(); addItem(product) }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${hovered ? 'bg-[#1E4631] text-white shadow-md' : 'bg-[#F4F6F4] text-[#1E4631]'}`}
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function PromoBanners() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(8)
      if (data) setProducts(normalizeProducts(data))
      setLoading(false)
    }
    fetchFeatured()
  }, [])

  return (
    <>
      {/* Mobile: Original Promo Banners */}
      <MobilePromoBanners />

      {/* Desktop: Featured Plant Grid */}
      <section className="hidden md:block py-20 bg-white" ref={ref}>
        <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-12"
          >
            <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none">
              Featured Plant
            </h2>
            <Link
              href="/shop"
              className="text-[#1E4631] text-sm font-bold uppercase tracking-[0.1em] hover:text-[#D27D56] transition-colors flex items-center gap-2"
            >
              View All <span>→</span>
            </Link>
          </motion.div>

          {/* Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E4631]" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-6">
              {products.slice(0, 8).map((product, i) => (
                <FeaturedCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
