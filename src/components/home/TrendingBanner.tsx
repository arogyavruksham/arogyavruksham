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
    badgeColor: "bg-white text-black border border-gray-200",
    subtitle: "Trending Collection",
    title: "Elegant & Tolerant",
    description: "We are only beginning to understand the impact indoor air quality has on our mental health and work performance, but so far, the introduction of indoor plants to improve indoor air and reduce pollution points to positive outcomes.\n\nIt's true when we say plants make people happy.",
    image: "/images/promo/trending_banner.png",
    fallback: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 2,
    badge: "35%",
    badgeLabel: "SALE",
    badgeColor: "bg-white text-black border border-gray-200",
    subtitle: "Indoor Sanctuary",
    title: "Vibrant & Tropical",
    description: "Infuse your home and workspace with deep green calmness and active tropical air purification. Thriving effortlessly with minimal irrigation, these magnificent foliage specimens promote mindfulness and productivity.\n\nTransform your everyday room into an authentic living sanctuary.",
    image: "/images/promo/house_plant.png",
    fallback: "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 3,
    badge: "New",
    badgeLabel: "DROP",
    badgeColor: "bg-white text-black border border-gray-200",
    subtitle: "Desert Minimalism",
    title: "Architectural Flora",
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
            <div className="w-[55%] h-full bg-[#FAFAFA]"></div>
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
              <div className={`absolute top-20 left-20 md:left-32 ${slide.badgeColor} rounded-full flex flex-col items-center justify-center w-24 h-24 shadow-sm z-20 transition-colors duration-500`}>
                <span className="font-serif text-2xl font-light leading-none">{slide.badge}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] leading-none mt-1 text-gray-500">{slide.badgeLabel}</span>
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
              <p className="text-gray-400 font-semibold text-[10px] uppercase tracking-[0.25em] mb-4">{slide.subtitle}</p>
              <h2 className="font-serif font-medium text-[42px] md:text-[56px] text-black leading-[1.05] mb-8">
                {slide.title}
              </h2>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-xl mb-10 whitespace-pre-line">
                {slide.description}
              </p>
              <Link href="/shop" className="inline-block border border-black text-black text-[11px] font-semibold tracking-[0.2em] uppercase px-8 py-3 hover:bg-black hover:text-white transition-colors duration-300">
                Shop Now
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
                  className={`h-[2px] transition-all duration-300 ${currentSlide === idx ? 'bg-black w-8' : 'bg-gray-300 hover:bg-gray-400 w-4'}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-12 h-12 bg-white text-black border border-gray-200 flex items-center justify-center hover:border-black active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 stroke-[1.5]" />
              </button>
              <button 
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-12 h-12 bg-white text-black border border-gray-200 flex items-center justify-center hover:border-black active:scale-95 transition-all"
              >
                <ChevronRight className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
