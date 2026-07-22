'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Award, Leaf, Heart } from 'lucide-react'

const slides = [
  {
    id: 1,
    subtitle: "INDOOR OASIS",
    title: "Breathe Easy",
    description: "Handpicked indoor plants for every room in your house.",
    buttonText: "Shop Indoor",
    buttonLink: "/shop?collection=indoor",
    image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80",
    bgColor: "#1c110f",
    buttonColor: "bg-[#4CAF50] hover:bg-[#45a049] text-white"
  },
  {
    id: 2,
    subtitle: "RARE SUCCULENTS",
    title: "Desert Beauties",
    description: "Exquisite and low-maintenance succulents for your desk.",
    buttonText: "Explore Succulents",
    buttonLink: "/shop?collection=succulents",
    image: "https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80",
    bgColor: "#1A1A1A",
    buttonColor: "bg-[#E5E7EB] hover:bg-white text-gray-900"
  },
  {
    id: 3,
    subtitle: "EVERYDAY GREENS",
    title: "Nature Meets Home",
    description: "Discover our new arrivals of resilient and beautiful greenery.",
    buttonText: "View Arrivals",
    buttonLink: "/shop?sort=new",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80",
    bgColor: "#141C24",
    buttonColor: "bg-[#4CAF50] hover:bg-[#45a049] text-white"
  }
]

export function DualHeroBanners() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="pt-4 pb-2 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Banner Container */}
        <div className="relative w-full h-[280px] md:h-[400px] rounded-[12px] overflow-hidden flex shadow-xl">
          
          {/* Global Noise Texture Overlay for that premium "smooth" but textured feel */}
          <div 
            className="absolute inset-0 z-40 opacity-[0.03] mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          ></div>

          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 flex flex-col justify-between"
              style={{ backgroundColor: slides[currentSlide].bgColor }}
            >
              {/* Background Image (Right side) */}
              <div className="absolute top-0 right-0 w-[90%] md:w-[60%] h-full z-0 overflow-hidden">
                {/* Smooth horizontal gradient to blend image with background */}
                <div 
                  className="absolute inset-0 z-10"
                  style={{ background: `linear-gradient(to right, ${slides[currentSlide].bgColor} 0%, transparent 40%, transparent 100%)` }}
                ></div>
                {/* Smooth vertical gradient from bottom to blend with features bar */}
                <div 
                  className="absolute inset-0 z-10"
                  style={{ background: `linear-gradient(to top, ${slides[currentSlide].bgColor} 0%, transparent 30%, transparent 100%)` }}
                ></div>
                <motion.img 
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 6, ease: "linear" }}
                  src={slides[currentSlide].image} 
                  alt={slides[currentSlide].title} 
                  className="w-full h-full object-cover object-center opacity-90"
                />
              </div>

              {/* Content (Left side) */}
              <div className="relative z-20 w-full md:w-2/3 h-full flex flex-col justify-center max-md:justify-start pl-5 md:pl-20 py-8 max-md:pt-6">
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-[#C29B62] font-semibold text-[10px] md:text-xs tracking-[0.2em] mb-3 md:mb-5 uppercase max-md:hidden"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-white font-serif text-4xl md:text-6xl lg:text-7xl font-medium tracking-wide mb-3 md:mb-6 leading-[1.1]"
                >
                  <span className="max-md:block">{slides[currentSlide].title.split(' ')[0]}</span>{' '}
                  <span className="max-md:block">{slides[currentSlide].title.split(' ').slice(1).join(' ')}</span>
                </motion.h2>

                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-gray-200 text-[13px] md:text-[17px] mb-8 md:mb-10 max-w-[240px] md:max-w-[420px] leading-relaxed pr-2"
                >
                  {slides[currentSlide].description}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="max-md:absolute max-md:bottom-0 max-md:left-0 max-md:w-[65%]"
                >
                  <Link 
                    href={slides[currentSlide].buttonLink} 
                    className={`${slides[currentSlide].buttonColor} text-[13px] md:text-[15px] font-medium py-3 px-8 rounded-[4px] w-fit transition-all hover:scale-105 inline-flex items-center justify-center gap-2 max-md:w-full max-md:rounded-none max-md:rounded-tr-xl max-md:py-3`}
                  >
                    {slides[currentSlide].buttonText}
                    <span className="text-lg leading-none font-light max-md:text-sm">&rsaquo;</span>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>


          
          {/* Slide Indicators */}
          <div className="absolute right-6 md:right-12 bottom-8 max-md:bottom-4 max-md:right-4 z-30 flex gap-2 max-md:gap-1.5">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 max-md:h-1 rounded-full transition-all duration-500 ease-out ${currentSlide === index ? 'w-8 max-md:w-6 bg-white' : 'w-2 bg-white/30 hover:bg-white/60'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
