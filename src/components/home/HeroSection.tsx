'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const IMAGES = [
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1416879598555-220025f82c0b?auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1459156212016-c812468e2115?auto=format&fit=crop&q=80',
]

// Base fan out configuration for 5 images (Desktop)
const FAN_CONFIG = [
  { rotate: -24, x: -300, y: 40 },
  { rotate: -12, x: -150, y: 15 },
  { rotate: 0, x: 0, y: 0 },
  { rotate: 12, x: 150, y: 15 },
  { rotate: 24, x: 300, y: 40 },
]

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[#FBFBF9] py-12 md:py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent"></div>
      
      {/* Text Content - Top */}
      <div className="container mx-auto px-4 relative z-20 text-center flex flex-col items-center mt-8">
        <span className="text-secondary font-sans font-bold tracking-widest uppercase text-sm mb-4">Authentic Nature</span>
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-primary mb-4 leading-tight">
          Green Elegance
        </h1>
        <p className="font-sans text-xl md:text-2xl text-foreground/80 font-medium max-w-2xl">
          Bring nature indoors, breath of fresh air, timeless green.
        </p>
      </div>

      {/* Plant Stack Animation */}
      <div className="relative w-full max-w-5xl h-[350px] md:h-[500px] mt-8 mb-8 md:mt-16 md:mb-16 flex items-center justify-center z-10 pointer-events-none">
        {mounted && IMAGES.map((src, index) => {
          const config = FAN_CONFIG[index];
          // Scale down the spread on mobile
          const scaleMultiplier = isMobile ? 0.4 : 1;
          
          return (
            <motion.div
              key={index}
              className="absolute w-[160px] md:w-[260px] aspect-[2/3] rounded-xl shadow-2xl border-4 border-white overflow-hidden bg-white"
              initial={{ 
                rotate: 0, 
                x: 0, 
                y: 100,
                opacity: 0,
                scale: 0.8
              }}
              animate={{ 
                rotate: config.rotate,
                x: config.x * scaleMultiplier,
                y: config.y * scaleMultiplier,
                opacity: 1,
                scale: 1
              }}
              transition={{ 
                type: 'spring', 
                damping: 20, 
                stiffness: 80,
                delay: 0.1 + (index * 0.1) 
              }}
              style={{ zIndex: index }}
            >
              <img 
                src={src} 
                alt={`Plant ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </motion.div>
          )
        })}
      </div>

      {/* Text Content - Bottom */}
      <div className="container mx-auto px-4 relative z-20 text-center flex flex-col items-center">
        <p className="font-sans text-base md:text-lg text-foreground/70 max-w-2xl mb-8">
          Discover our curated collection of authentic, hand-grown plants from the finest nurseries.
        </p>
        <Link 
          href="/shop" 
          className="bg-primary text-white px-10 py-4 rounded-full font-sans font-semibold text-lg hover:bg-primary-light hover:scale-105 transition-all duration-300 shadow-xl shadow-primary/20 pointer-events-auto"
        >
          Explore Collection
        </Link>
      </div>
    </section>
  )
}
