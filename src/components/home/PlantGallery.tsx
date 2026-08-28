'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { useHomepageImages } from '@/lib/homepageImages'

const imageVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.6, ease: 'easeOut' as const },
  }),
}

export function PlantGallery() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const images = useHomepageImages()

  return (
    <section className="hidden md:block py-24 bg-white" ref={ref}>
      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="font-serif text-[40px] text-[#1a1a1a] font-medium leading-none mb-4">
            Explore Our Plant Gallery
          </h2>
          <p className="text-gray-500 font-sans text-base max-w-lg mx-auto">
            A curated collection of botanical beauty for your inspiration.
          </p>
        </motion.div>

        {/* Bento / Masonry Grid */}
        <div className="grid grid-cols-4 grid-rows-3 gap-4 h-[700px]">
          {/* Large left image - spans 2 cols, 2 rows */}
          <motion.div
            custom={0}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="col-span-2 row-span-2 rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_1}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Top middle */}
          <motion.div
            custom={1}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_2}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Top right */}
          <motion.div
            custom={2}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_3}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Middle right - spans 2 cols */}
          <motion.div
            custom={3}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="col-span-2 rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_4}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* Bottom row - 3 images */}
          <motion.div
            custom={4}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_5}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          <motion.div
            custom={5}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="col-span-2 rounded-[20px] overflow-hidden group"
          >
            <img
              src={images.gallery_6}
              alt="Plant gallery"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>

          {/* CTA card in last slot */}
          <motion.div
            custom={6}
            variants={imageVariant}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="rounded-[20px] bg-[#1E4631] flex flex-col items-center justify-center text-center p-6 group cursor-pointer"
          >
            <p className="text-white/70 text-xs font-bold uppercase tracking-[0.2em] mb-3">
              Explore More
            </p>
            <Link
              href="/shop"
              className="bg-white text-[#1E4631] text-[11px] font-bold tracking-[0.15em] uppercase px-6 py-3 rounded-full hover:bg-[#F4F6F4] transition-colors inline-block"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
