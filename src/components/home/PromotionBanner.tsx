'use client'

import Link from 'next/link'

interface PromotionBannerProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  imageSrc: string;
}

export function PromotionBanner({ title, description, buttonText, buttonLink, imageSrc }: PromotionBannerProps) {

  return (
    <section className="w-full bg-[#f4f8f5] py-16 my-10 border-y border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 xl:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* Left: Heading */}
        <div className="w-full md:w-1/3 flex justify-center md:justify-center">
          <h2 className="font-sans text-[36px] lg:text-[44px] font-bold text-gray-900 leading-tight max-w-[280px] text-center md:text-left">
            {title}
          </h2>
        </div>

        {/* Center: Image */}
        <div className="w-full md:w-1/3 flex justify-center h-[350px] lg:h-[400px]">
          <img 
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover shadow-sm"
          />
        </div>

        {/* Right: Text and Button */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left pt-6 md:pt-0">
          <div className="max-w-[280px]">
            <p className="text-gray-500 text-[14px] leading-relaxed mb-6 font-sans">
              {description}
            </p>
            <Link
              href={buttonLink}
              className="inline-flex items-center justify-center bg-[#166534] text-white font-medium text-[15px] px-8 py-2.5 hover:bg-[#155a2d] transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}
