'use client'

import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    badge: "50%",
    badgeLabel: "OFF",
    badgeColor: "bg-[#ffb156]",
    subtitle: "Trending Plant 2026",
    title: "Elegant and tolerant plant",
    description: "We are only beginning to understand the impact indoor air quality has on our mental health and work performance, but so far, the introduction of indoor plants to improve indoor air and reduce pollution points to positive outcomes.\n\nIt's true when we say plants make people happy.",
    image: "/images/promo/trending_banner.png",
    fallback: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    badge: "35%",
    badgeLabel: "SALE",
    badgeColor: "bg-[#689f38]",
    subtitle: "Indoor Sanctuary 2026",
    title: "Vibrant tropical air purifier",
    description: "Infuse your home and workspace with deep green calmness and active tropical air purification. Thriving effortlessly with minimal irrigation, these magnificent foliage specimens promote mindfulness and productivity.\n\nTransform your everyday room into an authentic living sanctuary.",
    image: "/images/promo/house_plant.png",
    fallback: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    badge: "40%",
    badgeLabel: "OFF",
    badgeColor: "bg-[#235839]",
    subtitle: "Desert Minimalism",
    title: "Architectural desert flora",
    description: "Featuring bold architectural geometry and virtually zero maintenance irrigation demands, our sculptural desert botanicals represent modern interior serenity at its absolute peak.\n\nCustom crafted for modern offices, living rooms, and sunlit windowsills.",
    image: "/images/promo/cactus.png",
    fallback: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?q=80&w=800&auto=format&fit=crop"
  }
]

export function TrendingBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
  }

  const slide = SLIDES[currentSlide]

  return (
    <section className="py-24 bg-white overflow-hidden" ref={ref}>
      <div className="container mx-auto px-4 lg:px-8 max-w-[1400px]">
        <div className="relative flex flex-col md:flex-row items-center h-auto md:h-[500px]">
          
          {/* Background Split */}
          <div className="absolute inset-0 flex">
            <div className="w-[55%] h-full bg-[#f8f9fb]"></div>
            <div className="w-[45%] h-full bg-white"></div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${slide.id}`}
              initial={{ opacity: 0, x: -30 }} 
              animate={inView ? { opacity: 1, x: 0 } : {}} 
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-full md:w-[50%] h-[400px] md:h-[600px] flex items-end justify-center md:justify-end pr-0 md:pr-12 pt-12 md:pt-0 shrink-0"
            >
              {/* Discount Badge */}
              <div className={`absolute top-20 left-20 md:left-32 ${slide.badgeColor} text-white rounded-xl p-4 flex flex-col items-center justify-center w-24 h-24 shadow-sm z-20 transition-colors duration-500`}>
                <span className="font-serif text-2xl font-light leading-none">{slide.badge}</span>
                <span className="font-serif text-xl font-light tracking-widest leading-none mt-1">{slide.badgeLabel}</span>
              </div>

              <img 
                src={slide.image} 
                alt={slide.title}
                onError={(e) => { e.currentTarget.src = slide.fallback; }}
                className="w-auto h-[120%] max-h-[700px] object-contain mix-blend-multiply origin-bottom transform translate-y-12 drop-shadow-sm"
              />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 25 }} 
              animate={inView ? { opacity: 1, y: 0 } : {}} 
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative z-10 w-full md:w-[50%] pl-8 md:pl-16 pr-8 pt-12 md:pt-0 flex-1 pb-16 md:pb-0"
            >
              <p className="font-serif italic text-[#78b144] text-[15px] mb-2">{slide.subtitle}</p>
              <h2 className="font-sans font-bold text-[36px] md:text-[42px] text-[#111] leading-[1.1] mb-6">
                {slide.title}
              </h2>
              <p className="text-[#666] text-[14px] leading-[1.8] max-w-xl mb-8 whitespace-pre-line">
                {slide.description}
              </p>
              <Link href="/shop" className="text-[#78b144] text-[13px] font-bold tracking-widest uppercase hover:text-[#5b8a30] transition-colors">
                SHOP NOW
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows & Indicators */}
          <div className="absolute bottom-4 md:-bottom-24 right-8 z-30 flex items-center gap-6">
            <div className="flex gap-2">
              {SLIDES.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-[#78b144] w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
            <div className="flex shadow-sm">
              <button 
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-14 h-14 bg-black text-white flex items-center justify-center hover:bg-[#689f38] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-14 h-14 bg-black text-white border-l border-white/20 flex items-center justify-center hover:bg-[#689f38] active:scale-95 transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
