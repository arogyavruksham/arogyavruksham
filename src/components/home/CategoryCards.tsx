'use client'

import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { useHomepageImages } from '@/lib/homepageImages'

const categories = [
  {
    imageKey: 'category_1',
    title: 'Indoor House Plants',
    link: '/shop?category=Indoor%20Plants',
  },
  {
    imageKey: 'category_2',
    title: 'Low Maintenance Gardening',
    link: '/shop?category=Succulents',
  },
  {
    imageKey: 'category_3',
    title: 'Air Purifying House Plants',
    link: '/shop?category=Air%20Purifying',
  },
]

const cardVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.21, 0.47, 0.32, 0.98] as const },
  }),
}

export function CategoryCards() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const images = useHomepageImages()

  return (
    <section className="hidden md:block py-20 bg-white" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
        <div className="grid grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.imageKey}
              custom={i}
              variants={cardVariant}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
            >
              <Link
                href={cat.link}
                className="group relative block h-[340px] rounded-[24px] overflow-hidden"
              >
                <img
                  src={images[cat.imageKey]}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <h3 className="font-serif text-[24px] font-medium text-white leading-tight">
                    {cat.title}
                  </h3>
                  <div className="mt-3 flex items-center gap-2 text-white/80 text-sm font-semibold group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                    Shop Now <span>→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
