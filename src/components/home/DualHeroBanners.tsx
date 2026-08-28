'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react'
import { MobileHomeHeader } from './MobileHomeHeader'
import { useHomepageImages } from '@/lib/homepageImages'

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
  const heroImages = useHomepageImages()

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

      {/* ─── DESKTOP VIEW — Split Hero ─── */}
      <section className="hidden md:block relative w-full min-h-[85vh] overflow-hidden bg-white">
        <div className="container mx-auto px-6 lg:px-12 xl:px-16 max-w-[1440px] h-full">
          <div className="flex items-center min-h-[85vh] gap-12 lg:gap-16">

            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="w-full lg:w-[48%] shrink-0 py-16"
            >
              <div className="flex items-center gap-3 mb-6">
                <Leaf className="w-5 h-5 text-[#1E4631]" />
                <span className="text-[#1E4631] text-xs font-bold tracking-[0.25em] uppercase">
                  Arogyavruksham
                </span>
              </div>

              <h1 className="font-serif text-[42px] lg:text-[52px] xl:text-[60px] font-medium text-[#1a1a1a] leading-[1.1] tracking-tight mb-6">
                Customize your place with the{' '}
                <span className="italic text-[#1E4631]">best possible</span>{' '}
                plant solutions!
              </h1>

              <p className="text-gray-500 text-base lg:text-lg leading-relaxed max-w-md font-sans mb-10">
                Bring nature indoors with our curated collection of premium indoor plants, delivered fresh to your doorstep.
              </p>

              <div className="flex items-center gap-4 mb-12">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center bg-[#1E4631] text-white font-semibold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-[#153424] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Explore Now
                </Link>
                <Link
                  href="/shop?sale=true"
                  className="inline-flex items-center justify-center border-2 border-[#1E4631] text-[#1E4631] font-semibold text-[12px] tracking-[0.15em] uppercase px-8 py-4 rounded-full hover:bg-[#1E4631] hover:text-white transition-all duration-300"
                >
                  View Best Deals
                </Link>
              </div>

              {/* Trust row */}
              <div className="flex items-center gap-8 text-xs text-gray-400 font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1E4631]"></span>
                  Free Shipping
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D27D56]"></span>
                  Fresh Guarantee
                </span>
              </div>
            </motion.div>

            {/* Right: Image Mosaic Grid */}
            <div className="hidden lg:grid grid-cols-3 grid-rows-2 gap-3 flex-1 h-[580px]">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="col-span-2 row-span-1 rounded-[20px] overflow-hidden"
              >
                <img
                  src={heroImages.hero_grid_1}
                  alt="Living room plants"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="rounded-[20px] overflow-hidden"
              >
                <img
                  src={heroImages.hero_grid_2}
                  alt="Planting hands"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.7 }}
                className="rounded-[20px] overflow-hidden"
              >
                <img
                  src={heroImages.hero_grid_3}
                  alt="Tropical plants"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.7 }}
                className="rounded-[20px] overflow-hidden"
              >
                <img
                  src={heroImages.hero_grid_4}
                  alt="Indoor greenery"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65, duration: 0.7 }}
                className="rounded-[20px] overflow-hidden"
              >
                <img
                  src={heroImages.hero_grid_5}
                  alt="Botanical collection"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
