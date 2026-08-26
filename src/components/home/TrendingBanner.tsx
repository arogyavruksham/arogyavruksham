'use client'

import Link from 'next/link'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Leaf } from 'lucide-react'

const SLIDES = [
  {
    id: 1,
    badge: "50%",
    badgeLabel: "OFF",
    badgeColor: "bg-[#D27D56] text-white",
    subtitle: "Trending Collection",
    title: "Elegant & Tolerant",
    description: "We are only beginning to understand the impact indoor air quality has on our mental health and work performance, but so far, the introduction of indoor plants to improve indoor air and reduce pollution points to positive outcomes.\n\nIt's true when we say plants make people happy.",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 2,
    badge: "35%",
    badgeLabel: "SALE",
    badgeColor: "bg-[#1E4631] text-white",
    subtitle: "Indoor Sanctuary",
    title: "Vibrant & Tropical",
    description: "Infuse your home and workspace with deep green calmness and active tropical air purification. Thriving effortlessly with minimal irrigation, these magnificent foliage specimens promote mindfulness and productivity.\n\nTransform your everyday room into an authentic living sanctuary.",
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: 3,
    badge: "New",
    badgeLabel: "DROP",
    badgeColor: "bg-white text-[#1E4631] shadow-xl",
    subtitle: "Desert Minimalism",
    title: "Architectural Flora",
    description: "Featuring bold architectural geometry and virtually zero maintenance irrigation demands, our sculptural desert botanicals represent modern interior serenity at its absolute peak.\n\nCustom crafted for modern offices, living rooms, and sunlit windowsills.",
    image: "https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&q=80&w=800",
  }
]

export function TrendingBanner() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)

  const slide = SLIDES[currentSlide]

  return (
    <section className="py-20 md:py-32 bg-white overflow-hidden relative" ref={ref}>
      {/* Decorative leaf background pattern */}
      <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none w-1/2 h-full flex items-center justify-center">
        <Leaf size={600} className="text-[#1E4631]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-[1440px]">
        <div className="relative bg-[#FAFAF7] rounded-[40px] flex flex-col md:flex-row items-center h-auto min-h-[600px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden border border-[#F4F6F4]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`image-${slide.id}`}
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={inView ? { opacity: 1, scale: 1 } : {}} 
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-full md:w-[50%] h-[400px] md:h-full flex items-center justify-center bg-[#F4F6F4]/50 p-12 shrink-0"
            >
              {/* Discount Badge */}
              <div className={`absolute top-12 left-12 ${slide.badgeColor} rounded-full flex flex-col items-center justify-center w-24 h-24 shadow-lg z-20 transition-all duration-500 transform hover:scale-110 cursor-default`}>
                <span className="font-serif text-3xl font-medium leading-none mb-1">{slide.badge}</span>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] leading-none opacity-80">{slide.badgeLabel}</span>
              </div>

              <img 
                src={slide.image} 
                alt={slide.title}
                className="w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`text-${slide.id}`}
              initial={{ opacity: 0, y: 30 }} 
              animate={inView ? { opacity: 1, y: 0 } : {}} 
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="relative z-10 w-full md:w-[50%] p-10 md:p-16 lg:p-24 flex-1 flex flex-col justify-center"
            >
              <div className="flex items-center gap-4 mb-6">
                <span className="w-10 h-[2px] bg-[#D27D56]"></span>
                <p className="text-[#D27D56] font-bold text-[11px] uppercase tracking-[0.25em]">{slide.subtitle}</p>
              </div>
              
              <h2 className="font-serif font-medium text-[42px] lg:text-[56px] text-[#1a1a1a] leading-[1.1] mb-8">
                {slide.title}
              </h2>
              <p className="text-gray-600 text-[16px] leading-relaxed max-w-xl mb-12 whitespace-pre-line font-sans">
                {slide.description}
              </p>
              <Link href="/shop" className="inline-flex items-center justify-center bg-[#1E4631] text-white text-[12px] font-bold tracking-[0.15em] uppercase px-10 py-4 rounded-full hover:bg-[#153424] transition-all duration-300 shadow-lg hover:shadow-xl w-fit group">
                Shop Collection
                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows & Indicators */}
          <div className="absolute bottom-8 right-8 z-30 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex gap-2">
              {SLIDES.map((s, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 transition-all duration-300 rounded-full ${currentSlide === idx ? 'bg-[#1E4631] w-8' : 'bg-gray-300 hover:bg-gray-400 w-2'}`}
                />
              ))}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={prevSlide}
                aria-label="Previous slide"
                className="w-12 h-12 bg-white text-[#1E4631] rounded-full shadow-md flex items-center justify-center hover:bg-[#F4F6F4] active:scale-95 transition-all"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2]" />
              </button>
              <button 
                onClick={nextSlide}
                aria-label="Next slide"
                className="w-12 h-12 bg-white text-[#1E4631] rounded-full shadow-md flex items-center justify-center hover:bg-[#F4F6F4] active:scale-95 transition-all"
              >
                <ChevronRight className="w-5 h-5 stroke-[2]" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  )
}
