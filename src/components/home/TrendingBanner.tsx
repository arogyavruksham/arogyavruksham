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
    badgeColor: "bg-[#2D6A4F]",
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
    badgeColor: "bg-[#E07A5F]",
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
    badgeColor: "bg-[#11311F]",
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
    }, 6000)
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
    <section className="py-24 bg-[#FCFBF8] overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24">
        <div className="relative flex flex-col md:flex-row items-center bg-[#F6F4ED] rounded-[2rem] overflow-hidden">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${slide.id}`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={inView ? { opacity: 1, scale: 1 } : {}} 
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full md:w-1/2 h-[450px] md:h-[650px] flex items-center justify-center shrink-0"
            >
              <div className="absolute inset-0 bg-[#E3E8E1]/50 rounded-[2rem] md:rounded-r-none md:rounded-l-[2rem] m-4 md:m-0 md:mr-8 overflow-hidden">
                {/* Discount Badge */}
                <div className={`absolute top-8 left-8 ${slide.badgeColor} text-white rounded-full p-4 flex flex-col items-center justify-center w-20 h-20 shadow-lg z-20 transition-colors duration-500`}>
                  <span className="font-serif text-2xl font-light leading-none">{slide.badge}</span>
                  <span className="font-sans text-[9px] font-bold tracking-widest leading-none mt-1">{slide.badgeLabel}</span>
                </div>
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  onError={(e) => { e.currentTarget.src = slide.fallback; }}
                  className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 30 }} 
              animate={inView ? { opacity: 1, y: 0 } : {}} 
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full md:w-1/2 p-10 md:p-16 lg:p-20 flex-1 flex flex-col justify-center"
            >
              <h2 className="font-serif font-medium text-4xl lg:text-5xl text-[#11311F] leading-[1.1] mb-6 tracking-tight">
                {slide.title}
              </h2>
              <p className="text-gray-600 text-[15px] leading-[1.8] max-w-lg mb-10 whitespace-pre-line">
                {slide.description}
              </p>
              <Link href="/shop" className="inline-flex w-fit items-center text-[12px] font-bold tracking-widest uppercase text-[#11311F] pb-2 border-b border-[#11311F]/30 hover:border-[#11311F] transition-all">
                Shop Collection
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute bottom-8 right-8 z-30 flex gap-2">
            <button 
              onClick={prevSlide}
              aria-label="Previous slide"
              className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-[#11311F] flex items-center justify-center hover:bg-[#11311F] hover:text-white transition-all shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              aria-label="Next slide"
              className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-full text-[#11311F] flex items-center justify-center hover:bg-[#11311F] hover:text-white transition-all shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
