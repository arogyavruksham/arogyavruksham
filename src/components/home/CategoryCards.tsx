'use client'

import Link from 'next/link'
import { useHomepageImages } from '@/lib/homepageImages'

export function CategoryCards() {
  const images = useHomepageImages()

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16">
        
        {/* Container for the Bento-style Grid */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 h-auto md:h-[600px]">
          
          {/* Left Column - 2 Stacked Images */}
          <div className="flex flex-col w-full md:w-1/2 gap-6 md:gap-8 h-[600px] md:h-full">
            
            {/* Top Left */}
            <Link 
              href="/shop?category=Indoor%20Plants"
              className="relative w-full h-[calc(50%-12px)] md:h-[calc(50%-16px)] overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_1 || "https://placehold.co/800x400/eeeeee/cccccc?text=Indoor+House+Plants"}
                alt="Indoor House Plants"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-1/2 left-8 md:left-12 -translate-y-1/2 bg-white/85 backdrop-blur-sm py-4 px-6 max-w-[200px]">
                <h3 className="font-sans text-[18px] font-bold text-gray-900 leading-snug">
                  Indoor<br/>House Plants
                </h3>
              </div>
            </Link>

            {/* Bottom Left */}
            <Link 
              href="/shop?category=Succulents"
              className="relative w-full h-[calc(50%-12px)] md:h-[calc(50%-16px)] overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_2 || "https://placehold.co/800x400/eeeeee/cccccc?text=Low+Maintenance"}
                alt="Low Maintenance Gardening"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-1/2 left-8 md:left-12 -translate-y-1/2 bg-white/85 backdrop-blur-sm py-4 px-6 max-w-[220px]">
                <h3 className="font-sans text-[18px] font-bold text-gray-900 leading-snug">
                  Low Maintenance<br/>Gardening
                </h3>
              </div>
            </Link>
          </div>

          {/* Right Column - 1 Tall Image */}
          <div className="w-full md:w-1/2 h-[400px] md:h-full">
            <Link 
              href="/shop?category=Air%20Purifying"
              className="relative w-full h-full overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_3 || "https://placehold.co/800x800/eeeeee/cccccc?text=Air+Purifying"}
                alt="Air Purifying House Plants"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-16 md:bottom-24 left-1/2 -translate-x-1/2 bg-white/85 backdrop-blur-sm py-4 px-6 text-center min-w-[240px]">
                <h3 className="font-sans text-[18px] font-bold text-gray-900 leading-snug">
                  Air Purifying House<br/>Plants
                </h3>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </section>
  )
}
