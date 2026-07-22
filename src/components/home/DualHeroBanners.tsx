'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const slides = [
  {
    id: 1,
    tag: 'INDOOR COLLECTION',
    title: 'Breathe Life Into',
    titleAccent: 'Your Space',
    description: 'Handpicked indoor plants for every room in your house. Delivered fresh to your doorstep.',
    buttonText: 'Shop Indoor Plants',
    buttonLink: '/shop?category=Indoor%20Plants',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-accent',
  },
  {
    id: 2,
    tag: 'RARE SUCCULENTS',
    title: 'Desert Beauties,',
    titleAccent: 'Zero Effort',
    description: 'Exquisite and low-maintenance succulents for your desk, windowsill, or living room.',
    buttonText: 'Explore Succulents',
    buttonLink: '/shop?category=Succulents',
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-secondary',
  },
  {
    id: 3,
    tag: 'NEW ARRIVALS',
    title: 'Nature Meets',
    titleAccent: 'Modern Living',
    description: 'Discover our newest collection of resilient, beautiful greenery for modern homes.',
    buttonText: 'View New Arrivals',
    buttonLink: '/shop?sort=new',
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-green-400',
  },
]

const textVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' as const }
  }),
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
}

const imageVariants = {
  enter: { scale: 1.08, opacity: 0 },
  center: { scale: 1, opacity: 1, transition: { duration: 0.9, ease: 'easeOut' as const } },
  exit: { scale: 1.02, opacity: 0, transition: { duration: 0.5 } }
}

export function DualHeroBanners() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = (index: number) => {
    setDirection(index > current ? 1 : -1)
    setCurrent(index)
  }
  const prev = () => go((current - 1 + slides.length) % slides.length)
  const next = () => go((current + 1) % slides.length)

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [current])

  const slide = slides[current]

  return (
    <section className="relative w-full h-[100vh] overflow-hidden bg-gray-100">
      {/* Background Image */}
      <AnimatePresence mode="sync">
        <motion.div key={slide.id} variants={imageVariants} initial="enter" animate="center" exit="exit"
          className="absolute inset-0 z-0">
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 lg:px-20">
          <div className="max-w-xl">
            <AnimatePresence mode="wait">
              <motion.div key={slide.id} className="space-y-4 md:space-y-6">
                {/* Tag */}
                <motion.p custom={0} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                  className={`text-xs md:text-sm font-bold tracking-[0.25em] uppercase ${slide.tagColor}`}>
                  {slide.tag}
                </motion.p>
                {/* Headline */}
                <motion.h1 custom={1} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                  className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white leading-[1.05]">
                  {slide.title}<br />
                  <span className="text-accent italic">{slide.titleAccent}</span>
                </motion.h1>
                {/* Description */}
                <motion.p custom={2} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                  className="text-white/75 text-sm md:text-base leading-relaxed max-w-sm">
                  {slide.description}
                </motion.p>
                {/* CTA */}
                <motion.div custom={3} variants={textVariants} initial="hidden" animate="visible" exit="exit">
                  <Link href={slide.buttonLink}
                    className="inline-block bg-primary text-white font-bold text-sm md:text-base px-8 py-3.5 rounded-sm hover:bg-primary-light transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/30">
                    {slide.buttonText}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Slide Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => go(i)} className={`transition-all duration-400 rounded-full ${i === current ? 'bg-white w-8 h-2' : 'bg-white/40 w-2 h-2'}`} />
        ))}
      </div>

      {/* Arrows */}
      <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 hover:bg-white/25 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center text-white transition-all">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-8 right-8 z-20 text-white/60 text-sm font-mono">
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </section>
  )
}
