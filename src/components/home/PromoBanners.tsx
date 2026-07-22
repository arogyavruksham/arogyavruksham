'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const banners = [
  {
    title: 'SALE',
    subtitle: 'Spring Store',
    accent: '50% OFF',
    label: 'Shop Now →',
    href: '/shop?sale=true',
    image: 'https://images.unsplash.com/photo-1416879598555-220025f82c0b?auto=format&fit=crop&q=80',
    bg: '#f0f4f0',
    textColor: 'text-gray-900',
    badgeColor: 'bg-primary text-white',
  },
  {
    title: 'House Plants',
    subtitle: 'New Trending 2024',
    accent: '',
    label: 'Explore →',
    href: '/shop?category=Indoor%20Plants',
    image: 'https://images.unsplash.com/photo-1593480749021-96894c502b4d?auto=format&fit=crop&q=80',
    bg: '#f5f5f0',
    textColor: 'text-gray-900',
    badgeColor: '',
  },
  {
    title: 'Potted In Home',
    subtitle: '50% OFF',
    accent: '',
    label: 'Shop Pots →',
    href: '/shop?category=Pots%20%26%20Planters',
    image: 'https://images.unsplash.com/photo-1487798452839-c748a707a6b2?auto=format&fit=crop&q=80',
    bg: '#f0f4f0',
    textColor: 'text-gray-900',
    badgeColor: '',
  },
]

function BannerCard({ banner, index }: { banner: typeof banners[0]; index: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={banner.href}
        className="group relative flex overflow-hidden border border-gray-200 hover:border-primary/40 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10"
        style={{ backgroundColor: banner.bg, minHeight: '200px' }}>
        
        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between flex-1">
          {banner.badgeColor && (
            <div className={`${banner.badgeColor} text-xs font-black tracking-widest px-3 py-1.5 w-fit mb-3`}>
              {banner.title}
            </div>
          )}
          {!banner.badgeColor && (
            <h3 className={`font-serif text-2xl md:text-3xl font-bold ${banner.textColor} leading-tight`}>{banner.title}</h3>
          )}
          <p className="text-gray-500 text-sm font-medium mt-1">{banner.subtitle}</p>
          {banner.accent && (
            <p className={`font-serif text-5xl font-black ${banner.textColor} mt-2 leading-none`}>{banner.accent}</p>
          )}
          <span className="mt-6 inline-flex items-center text-sm font-bold text-primary border-b-2 border-transparent group-hover:border-primary transition-all">
            {banner.label}
          </span>
        </div>

        {/* Image */}
        <div className="relative w-[45%] overflow-hidden">
          <motion.img
            src={banner.image} alt={banner.title}
            className="absolute inset-0 w-full h-full object-cover"
            whileHover={{ scale: 1.06 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Green border bottom on hover */}
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-500" />
      </Link>
    </motion.div>
  )
}

export function PromoBanners() {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, i) => (
            <BannerCard key={i} banner={banner} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
