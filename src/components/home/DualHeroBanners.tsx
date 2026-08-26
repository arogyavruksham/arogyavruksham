'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react'
import { MobileHomeHeader } from './MobileHomeHeader'

const slides = [
  {
    id: 1,
    tag: 'INDOOR OASIS',
    title: 'Breathe Life Into',
    titleAccent: 'Your Space',
    description: 'Handpicked botanical beauties to transform every room in your house. Delivered fresh and thriving to your doorstep.',
    buttonText: 'Shop Indoor Plants',
    buttonLink: '/shop?category=Indoor%20Plants',
    image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-[#D27D56]',
  },
  {
    id: 2,
    tag: 'RARE SUCCULENTS',
    title: 'Desert Beauties,',
    titleAccent: 'Zero Effort',
    description: 'Exquisite, low-maintenance succulents for your desk, windowsill, or living room. Nature\'s most resilient art.',
    buttonText: 'Explore Succulents',
    buttonLink: '/shop?category=Succulents',
    image: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-[#1E4631]',
  },
  {
    id: 3,
    tag: 'NEW ARRIVALS',
    title: 'Nature Meets',
    titleAccent: 'Modern Living',
    description: 'Discover our newest collection of resilient, beautiful greenery curated specifically for the modern home.',
    buttonText: 'View New Arrivals',
    buttonLink: '/shop?sort=new',
    image: 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80&w=1920',
    tagColor: 'text-green-500',
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
  enter: { scale: 1.05, opacity: 0 },
  center: { scale: 1, opacity: 1, transition: { duration: 1.2, ease: 'easeOut' as const } },
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
    const timer = setInterval(next, 6000)
    return () => clearInterval(timer)
  }, [current])

  const slide = slides[current]

  return (
    <>
      {/* ─── MOBILE VIEW ONLY ─── */}
      <div className="block md:hidden bg-[#FAFAF7] relative">
        <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-4 pb-0">
          <MobileHomeHeader />
        </div>
        
        <div className="relative w-full h-[85vh] overflow-hidden flex flex-col justify-end pt-24 pb-8 px-6">
          <AnimatePresence mode="sync">
            <motion.div key={slide.id} variants={imageVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 z-0">
              <Image 
                src={slide.image} 
                alt={slide.title}
                fill
                priority
                className="object-cover" 
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E4631]/90 via-[#1E4631]/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
          
          {/* Mobile Content Glass Card */}
          <div className="relative z-20 flex flex-col items-start w-full bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl shadow-2xl overflow-hidden">
            <div className="absolute -top-10 -right-10 text-white/5 pointer-events-none">
              <Leaf size={120} />
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div key={slide.id} className="relative z-10">
                <motion.p custom={0} variants={textVariants} initial="hidden" animate="visible" exit="exit" className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/80 mb-3 flex items-center gap-2">
                  <span className="w-6 h-[1px] bg-white/60"></span> {slide.tag}
                </motion.p>
                
                <motion.h1 custom={1} variants={textVariants} initial="hidden" animate="visible" exit="exit" className="text-4xl font-serif font-medium text-white leading-[1.1] mb-3 tracking-tight">
                  {slide.title}<br />
                  <span className="italic font-light text-white/90">{slide.titleAccent}</span>
                </motion.h1>
                
                <motion.p custom={2} variants={textVariants} initial="hidden" animate="visible" exit="exit" className="text-[13px] font-sans text-white/80 leading-relaxed mb-6 max-w-[280px]">
                  {slide.description}
                </motion.p>
                
                <motion.div custom={3} variants={textVariants} initial="hidden" animate="visible" exit="exit">
                  <Link 
                    href={slide.buttonLink}
                    className="inline-flex items-center justify-center bg-white text-[#1E4631] font-semibold text-[11px] tracking-[0.2em] uppercase px-8 py-4 rounded-full transition-transform active:scale-95 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
                  >
                    {slide.buttonText}
                  </Link>
                </motion.div>
              </motion.div>
            </AnimatePresence>
            
            {/* Mobile slide indicators */}
            <div className="flex gap-1.5 mt-6 w-full justify-center">
              {slides.map((_, i) => (
                <button key={i} onClick={() => go(i)} className={`transition-all duration-500 rounded-full ${i === current ? 'bg-white w-6 h-1.5' : 'bg-white/30 w-1.5 h-1.5'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── DESKTOP VIEW ─── */}
      <section className="hidden md:block relative w-full h-[90vh] min-h-[700px] overflow-hidden bg-[#FAFAF7]">
        {/* Background Image */}
        <AnimatePresence mode="sync">
          <motion.div key={slide.id} variants={imageVariants} initial="enter" animate="center" exit="exit" className="absolute inset-0 z-0">
            <Image src={slide.image} alt={slide.title} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E4631]/80 via-[#1E4631]/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
            <div className="max-w-xl relative">
              {/* Glassmorphism backing for better text readability and premium feel */}
              <div className="absolute -inset-8 bg-white/5 backdrop-blur-[2px] rounded-[40px] opacity-0 animate-fade-in pointer-events-none" />
              
              <AnimatePresence mode="wait">
                <motion.div key={slide.id} className="relative z-10 space-y-6">
                  {/* Tag */}
                  <motion.div custom={0} variants={textVariants} initial="hidden" animate="visible" exit="exit" className="flex items-center gap-4">
                    <span className="w-12 h-[2px] bg-white/60"></span>
                    <p className={`text-xs md:text-sm font-bold tracking-[0.25em] uppercase text-white/90`}>
                      {slide.tag}
                    </p>
                  </motion.div>
                  
                  {/* Headline */}
                  <motion.h1 custom={1} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                    className="text-5xl md:text-6xl lg:text-[72px] xl:text-[84px] font-serif font-medium text-white leading-[1.05] tracking-tight">
                    {slide.title}<br />
                    <span className="italic font-light text-white/90">{slide.titleAccent}</span>
                  </motion.h1>
                  
                  {/* Description */}
                  <motion.p custom={2} variants={textVariants} initial="hidden" animate="visible" exit="exit"
                    className="text-white/80 text-sm md:text-base leading-relaxed max-w-sm md:max-w-md font-sans">
                    {slide.description}
                  </motion.p>
                  
                  {/* CTA */}
                  <motion.div custom={3} variants={textVariants} initial="hidden" animate="visible" exit="exit" className="pt-6">
                    <Link href={slide.buttonLink}
                      className="group relative inline-flex items-center justify-center bg-white text-[#1E4631] overflow-hidden rounded-full font-semibold text-[11px] tracking-[0.2em] uppercase px-10 py-5 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)]">
                      <span className="relative z-10">{slide.buttonText}</span>
                      <div className="absolute inset-0 h-full w-full bg-[#FAFAF7] scale-0 rounded-full transition-all duration-300 ease-out group-hover:scale-100 origin-center z-0"></div>
                    </Link>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Custom Slide Navigation Controls */}
        <div className="absolute bottom-12 right-12 lg:right-24 z-20 flex flex-col items-end gap-6">
          <div className="flex gap-2 items-center">
            {slides.map((_, i) => (
              <button 
                key={i} 
                onClick={() => go(i)} 
                className={`transition-all duration-500 rounded-full hover:bg-white/80 ${i === current ? 'bg-white w-10 h-1.5' : 'bg-white/40 w-2 h-2'}`} 
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={prev} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 group">
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button onClick={next} className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 group">
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
