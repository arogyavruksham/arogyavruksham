'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    tag: '#POTTED PRODUCTS',
    slideNum: '01',
    total: '02',
    title: 'Your spring cleaning',
    titleLine2: 'for you',
    description:
      'A good houseplant is next best thing to a live-in housekeeper. They add a little pizazz and cosiness wherever you place them, and they can even help you get a better night\'s sleep.',
    cta: 'SHOP NOW',
    ctaHref: '/shop',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=900',
    bg: '#f0f4f0',
  },
  {
    id: 2,
    tag: '#INDOOR PLANTS',
    slideNum: '02',
    total: '02',
    title: 'Bring nature',
    titleLine2: 'indoors',
    description:
      'Transform any room into a lush, vibrant sanctuary. Our handpicked indoor plants are resilient, beautiful, and perfect for modern homes and offices.',
    cta: 'EXPLORE NOW',
    ctaHref: '/shop?category=Indoor%20Plants',
    image: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&q=80&w=900',
    bg: '#f5f5f0',
  },
]

export function DualHeroBanners() {
  const [current, setCurrent] = useState(0)
  const slide = slides[current]

  const next = () => setCurrent((c) => (c + 1) % slides.length)
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length)

  useEffect(() => {
    const t = setInterval(next, 5500)
    return () => clearInterval(t)
  }, [current])

  return (
    <>
      {/* ── SECTION 1: White minimal intro with floating plant ── */}
      <section className="relative w-full bg-white overflow-visible pt-10 pb-0">
        {/* Centered text */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4" style={{ minHeight: '180px' }}>
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.28em' }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="text-[10px] md:text-[11px] font-bold tracking-[0.28em] text-gray-500 uppercase mb-2"
          >
            LET YOURSELF BE SEDUCED
          </motion.p>
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.1em' }}
            animate={{ opacity: 1, letterSpacing: '0.28em' }}
            transition={{ duration: 1.2, delay: 0.15, ease: 'easeOut' }}
            className="text-[10px] md:text-[11px] font-bold tracking-[0.28em] text-gray-500 uppercase"
          >
            BY OUR NEW COLLECTIONS
          </motion.p>
          {/* Underline accent */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
            className="mt-3 h-[2px] w-16 bg-primary origin-center"
          />
        </div>

        {/* Floating Plant Image (overflows into next section) */}
        <div className="relative z-20 flex justify-end pr-12 md:pr-24 lg:pr-32 -mb-24 md:-mb-32 pointer-events-none select-none">
          <AnimatePresence mode="wait">
            <motion.img
              key={slide.id + '-top'}
              src={slide.image}
              alt="Plant"
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              className="w-[220px] md:w-[340px] lg:w-[420px] h-auto object-contain drop-shadow-2xl"
              style={{ maxHeight: '380px', objectFit: 'contain' }}
            />
          </AnimatePresence>
        </div>
      </section>

      {/* ── SECTION 2: Slider content (gray/light bg) ── */}
      <AnimatePresence mode="wait">
        <motion.section
          key={slide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: slide.bg, minHeight: '320px' }}
        >
          <div className="container mx-auto px-6 md:px-12 lg:px-20 flex items-center"
            style={{ minHeight: '320px', paddingTop: '100px', paddingBottom: '60px' }}>

            {/* Left: Rotated slide counter */}
            <div className="hidden md:flex flex-col items-center gap-3 mr-12 shrink-0 select-none" style={{ minWidth: '40px' }}>
              <span
                className="text-xs font-black text-gray-800 tracking-wider"
                style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', letterSpacing: '0.15em' }}
              >
                {slide.slideNum}
                <span className="text-gray-300 mx-1">/</span>
                {slide.total}
              </span>
              <div className="w-px h-14 bg-gray-400 mt-2" />
            </div>

            {/* Center: Content */}
            <div className="flex-1 max-w-lg">
              <motion.p
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="text-[11px] font-bold tracking-widest text-gray-500 uppercase mb-3"
              >
                {slide.tag}
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] mb-4"
              >
                {slide.title}<br />{slide.titleLine2}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm"
              >
                {slide.description}
              </motion.p>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Link href={slide.ctaHref}
                  className="inline-flex items-center gap-2 text-sm font-black text-primary hover:gap-4 transition-all duration-200 tracking-widest uppercase group">
                  {slide.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Prev / Next subtle arrows */}
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow-sm transition-colors text-gray-700 text-lg font-bold z-10">
            ‹
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/70 hover:bg-white flex items-center justify-center shadow-sm transition-colors text-gray-700 text-lg font-bold z-10">
            ›
          </button>

          {/* Slide dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-6 h-2' : 'bg-gray-400 w-2 h-2'}`} />
            ))}
          </div>

          {/* Slide counter bottom-right */}
          <div className="absolute bottom-5 right-6 text-xs font-mono text-gray-400 tracking-wider hidden md:block">
            {slide.slideNum} / {slide.total}
          </div>
        </motion.section>
      </AnimatePresence>
    </>
  )
}
