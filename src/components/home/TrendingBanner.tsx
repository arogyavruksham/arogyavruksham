'use client'

import Link from 'next/link'

export function TrendingBanner({ images }: { images: Record<string, string> }) {

  return (
    <section className="w-full bg-[#f4f8f5] py-16 my-10 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left: Heading */}
        <div className="w-full md:w-1/3 flex justify-start md:justify-center">
          <h2 className="font-sans text-[32px] lg:text-[40px] font-bold text-gray-900 leading-tight max-w-[280px]">
            The Benefits Of Indoor Plants
          </h2>
        </div>

        {/* Center: Image with semi-circle background */}
        <div className="w-full md:w-1/3 flex justify-center relative h-[300px] lg:h-[350px]">
          {/* Semi-circle background */}
          <div className="absolute bottom-0 w-[300px] lg:w-[350px] h-[150px] lg:h-[175px] bg-[#e1ece5] rounded-t-full z-0"></div>
          
          {/* Plant Image */}
          <img 
            src={images.benefits || "https://placehold.co/400x500/eeeeee/cccccc?text=Plant+Image"}
            alt="Benefits of Indoor Plants"
            className="absolute bottom-0 h-[110%] object-contain z-10 drop-shadow-xl"
          />
        </div>

        {/* Right: Text and Button */}
        <div className="w-full md:w-1/3 flex flex-col items-start md:items-center text-left md:text-left pt-6 md:pt-0">
          <div className="max-w-[280px]">
            <p className="text-gray-500 text-[14px] leading-relaxed mb-6 font-sans">
              Phasellus tempus dignissim crasendum facilisis. Mauris ut elit sed tincidunt convallis.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-[#166534] text-white font-medium text-[15px] px-8 py-2.5 hover:bg-[#155a2d] transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
