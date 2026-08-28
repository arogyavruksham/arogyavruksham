'use client'

import Link from 'next/link'

export function CategoryCards({ images }: { images: Record<string, string> }) {

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16">
        
        {/* Container for the Bento-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Left Column - 2 Stacked Images */}
          <div className="flex flex-col gap-6 md:gap-8">
            
            {/* Top Left */}
            <Link 
              href="/shop?category=Indoor%20Plants"
              className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_1 || "https://placehold.co/800x400/eeeeee/cccccc?text=Indoor+House+Plants"}
                alt="Indoor House Plants"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-1/2 left-8 md:left-12 -translate-y-1/2 bg-white/90 backdrop-blur-sm py-3.5 px-6 max-w-[200px] shadow-sm">
                <h3 className="font-sans text-[17px] font-bold text-gray-900 leading-snug">
                  Indoor<br/>House Plants
                </h3>
              </div>
            </Link>

            {/* Bottom Left */}
            <Link 
              href="/shop?category=Succulents"
              className="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_2 || "https://placehold.co/800x400/eeeeee/cccccc?text=Low+Maintenance"}
                alt="Low Maintenance Gardening"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-1/2 left-8 md:left-12 -translate-y-1/2 bg-white/90 backdrop-blur-sm py-3.5 px-6 max-w-[220px] shadow-sm">
                <h3 className="font-sans text-[17px] font-bold text-gray-900 leading-snug">
                  Low Maintenance<br/>Gardening
                </h3>
              </div>
            </Link>
          </div>

          {/* Right Column - 1 Tall Image */}
          <div className="w-full h-full">
            <Link 
              href="/shop?category=Air%20Purifying"
              className="relative w-full h-full min-h-[350px] overflow-hidden bg-gray-100 group block"
            >
              <img 
                src={images.category_3 || "https://placehold.co/800x800/eeeeee/cccccc?text=Air+Purifying"}
                alt="Air Purifying House Plants"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-12 md:bottom-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm py-4 px-8 text-center min-w-[260px] shadow-sm">
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
