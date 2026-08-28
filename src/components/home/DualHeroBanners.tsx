'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { useHomepageImages } from '@/lib/homepageImages'

export function DualHeroBanners() {
  const heroImages = useHomepageImages()

  return (
    <section className="w-full bg-white pt-10 pb-20">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        
        {/* Left: Text Content */}
        <div className="w-full lg:w-1/2 flex flex-col items-start pt-8">
          <h1 className="font-sans text-[44px] lg:text-[56px] xl:text-[64px] font-bold text-gray-900 leading-[1.15] tracking-tight mb-6">
            Customize your place<br />
            with the <span className="text-[#166534]">best</span> possible<br />
            plant solutions!
          </h1>
          
          <p className="text-gray-500 text-[15px] leading-relaxed max-w-md font-sans mb-10">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
          </p>

          <div className="flex items-center gap-8">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-[#166534] text-white font-medium text-[15px] px-8 py-3.5 hover:bg-[#155a2d] transition-colors"
            >
              Let's Shop Now
            </Link>
            
            <button className="flex items-center gap-3 text-gray-900 font-medium text-[15px] hover:text-[#166534] transition-colors group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 group-hover:border-[#166534] transition-colors">
                <Play className="w-4 h-4 fill-current ml-1" />
              </div>
              Know More About Us
            </button>
          </div>
        </div>

        {/* Right: Image Mosaic */}
        <div className="w-full lg:w-1/2 flex h-[500px] lg:h-[600px] gap-5">
          {/* Left tall image */}
          <div className="w-1/2 h-full">
            <img 
              src="https://placehold.co/400x800/eeeeee/cccccc?text=Plant+Vertical"
              alt="Vertical Plant"
              className="w-full h-full object-cover"
            />
          </div>
          {/* Right stacked images */}
          <div className="w-1/2 h-full flex flex-col gap-5">
            <div className="h-[calc(50%-10px)] w-full">
              <img 
                src="https://placehold.co/400x400/eeeeee/cccccc?text=Plant+Top"
                alt="Plant Top"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="h-[calc(50%-10px)] w-full">
              <img 
                src="https://placehold.co/400x400/eeeeee/cccccc?text=Plant+Bottom"
                alt="Plant Bottom"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
