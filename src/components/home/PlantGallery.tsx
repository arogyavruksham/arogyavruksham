'use client'

import Link from 'next/link'

export function PlantGallery({ images }: { images: Record<string, string> }) {

  return (
    <section className="py-16 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex flex-col items-center">
        
        {/* Title */}
        <h2 className="font-sans text-[28px] font-bold text-[#166534] mb-12">
          Explore Our Plant Gallery
        </h2>

        {/* 4-Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-12">
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img 
              src={images.gallery_1 || "https://placehold.co/500x500/eeeeee/cccccc?text=Gallery+1"}
              alt="Plant Gallery 1"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img 
              src={images.gallery_2 || "https://placehold.co/500x500/eeeeee/cccccc?text=Gallery+2"}
              alt="Plant Gallery 2"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img 
              src={images.gallery_3 || "https://placehold.co/500x500/eeeeee/cccccc?text=Gallery+3"}
              alt="Plant Gallery 3"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="aspect-square bg-gray-100 overflow-hidden">
            <img 
              src={images.gallery_4 || "https://placehold.co/500x500/eeeeee/cccccc?text=Gallery+4"}
              alt="Plant Gallery 4"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* View More Button */}
        <Link
          href="/shop"
          className="inline-flex items-center justify-center bg-[#166534] text-white font-medium text-[15px] px-10 py-2.5 hover:bg-[#155a2d] transition-colors"
        >
          View More
        </Link>
        
      </div>
    </section>
  )
}
