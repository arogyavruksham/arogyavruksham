'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useCategories } from '@/lib/categories'
import { useRef } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } }
}

export function CircularCategories() {
  const categories = useCategories()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section className="py-12 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
            <span className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Curated Collections
            </span>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900">Shop by Category</h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.5 }}>
            <Link href="/shop" className="text-primary font-bold hover:underline text-xs flex items-center gap-1">
              See All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>

        <motion.div ref={ref} variants={containerVariants} initial="hidden" animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link href={`/shop?category=${encodeURIComponent(category.slug || category.name)}`}
                className="group flex flex-col items-center gap-4">
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-100">
                  {category.image ? (
                    <motion.img src={category.image} alt={category.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.07 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="font-serif font-bold text-lg text-primary">{category.name.slice(0, 2)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-400" />
                  {/* Overlay label */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-primary">
                    <span className="text-white text-sm font-bold">Explore →</span>
                  </div>
                </div>
                <span className="font-semibold text-sm text-gray-800 group-hover:text-primary transition-colors text-center">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
