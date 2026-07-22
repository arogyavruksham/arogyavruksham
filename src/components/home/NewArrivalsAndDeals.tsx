'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { normalizeProducts } from '@/lib/categories'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

const TABS = ['All', 'Indoor Plants', 'Outdoor Plants', 'Succulents', 'Pots & Planters']

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: 'easeOut' as const }
  })
}

function ProductMiniCard({ product, index }: { product: any; index: number }) {
  const [hovered, setHovered] = useState(false)
  const { addItem } = useCartStore()
  const { isAuthenticated } = useAuthStore()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) { useAuthStore.getState().setAuthModalOpen(true); return }
    addItem({ id: product.id, title: product.title, price: product.price, imageUrl: product.image_url, quantity: 1, stock_count: product.stock_count })
  }

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible"
      onHoverStart={() => setHovered(true)} onHoverEnd={() => setHovered(false)}>
      <Link href={`/shop/${product.id}`} className="group block relative bg-[#f7f7f5] overflow-hidden">
        {/* Badge */}
        {product.original_price && (
          <span className="absolute top-2 left-2 z-10 bg-secondary text-white text-[10px] font-black px-2 py-0.5 rounded-full">SALE</span>
        )}
        {index === 1 && !product.original_price && (
          <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">HOT</span>
        )}

        {/* Image */}
        <div className="relative overflow-hidden aspect-square">
          <motion.img src={product.image_url} alt={product.title}
            className="w-full h-full object-cover"
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
          {/* Quick Add */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 8 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-2 left-2 right-2">
            <button onClick={handleAddToCart}
              className="w-full bg-primary text-white text-xs font-bold py-2 rounded-sm hover:bg-primary-light transition-colors">
              + Add to Cart
            </button>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-500 mb-0.5">{product.category}</p>
          <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-primary transition-colors">{product.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-primary">₹{product.price.toLocaleString('en-IN')}</span>
            {product.original_price && <span className="text-xs text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function NewArrivalsAndDeals() {
  const [activeTab, setActiveTab] = useState('All')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [dealProduct, setDealProduct] = useState<any>(null)
  const [dealIndex, setDealIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(12)
      if (data) {
        const normalized = normalizeProducts(data)
        setAllProducts(normalized)
        setDealProduct(normalized[0] || null)
      }
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const filtered = activeTab === 'All' ? allProducts : allProducts.filter(p => p.category === activeTab)
  const displayProducts = filtered.slice(0, 6)

  const prevDeal = () => {
    const idx = (dealIndex - 1 + allProducts.length) % allProducts.length
    setDealIndex(idx)
    setDealProduct(allProducts[idx])
  }
  const nextDeal = () => {
    const idx = (dealIndex + 1) % allProducts.length
    setDealIndex(idx)
    setDealProduct(allProducts[idx])
  }

  return (
    <section ref={ref} className="py-12 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12">

          {/* Left: New Arrivals */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">New Arrivals</h2>
              <Link href="/shop" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                See All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* Tabs */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4 overflow-x-auto scrollbar-hide mb-6 border-b border-gray-100">
              {TABS.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`pb-2.5 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 transition-all duration-200 ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                  {tab}
                </button>
              ))}
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : displayProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">No plants in this category yet.</div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {displayProducts.map((product, i) => (
                    <ProductMiniCard key={product.id} product={product} index={i} />
                  ))}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Right: Deal of the Day */}
          <div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.15 }}
              className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Deals Of The Day</h2>
              <div className="flex gap-2">
                <button onClick={prevDeal} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={nextDeal} className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-primary hover:text-primary transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            <AnimatePresence mode="wait">
              {dealProduct && (
                <motion.div key={dealProduct.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-[#f7f7f5] relative overflow-hidden">
                  <div className="aspect-[4/5] overflow-hidden">
                    <motion.img src={dealProduct.image_url} alt={dealProduct.title}
                      className="w-full h-full object-cover"
                      initial={{ scale: 1.05 }} animate={{ scale: 1 }} transition={{ duration: 0.7 }}
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-xs text-gray-500 mb-1">{dealProduct.category}</p>
                    <h3 className="font-serif text-xl font-bold text-gray-900 mb-2">{dealProduct.title}</h3>
                    <div className="flex items-center gap-3 mb-5">
                      <span className="text-2xl font-bold text-primary">₹{dealProduct.price.toLocaleString('en-IN')}</span>
                      {dealProduct.original_price && <span className="text-sm text-gray-400 line-through">₹{dealProduct.original_price.toLocaleString('en-IN')}</span>}
                    </div>
                    <Link href={`/shop/${dealProduct.id}`}
                      className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3 hover:bg-primary-light transition-all duration-300 hover:gap-3">
                      SHOP NOW <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
