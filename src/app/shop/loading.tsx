import React from 'react'

export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-12">
        <div className="h-10 md:h-12 bg-gray-200/80 rounded-xl max-w-xs mb-4"></div>
        <div className="w-16 h-1 bg-[#235839]/30 mb-6"></div>
        <div className="space-y-2 max-w-2xl">
          <div className="h-4 bg-gray-200/80 rounded-lg w-full"></div>
          <div className="h-4 bg-gray-200/80 rounded-lg w-4/5"></div>
        </div>
      </div>

      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-8">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="flex flex-col space-y-3">
            {/* Image Placeholder */}
            <div className="w-full aspect-[4/5] bg-gray-100/90 rounded-[24px] border border-gray-200/50 p-4 flex flex-col justify-between shadow-2xs">
              <div className="w-12 h-5 bg-gray-200/80 rounded-full"></div>
              <div className="w-full h-28 bg-gray-200/50 rounded-xl my-2"></div>
            </div>
            {/* Title & Price Placeholder */}
            <div className="px-1 space-y-2">
              <div className="h-4 bg-gray-200/80 rounded-md w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
              <div className="pt-1 flex items-center justify-between">
                <div className="h-4 bg-[#235839]/20 rounded-md w-16"></div>
                <div className="h-7 w-7 rounded-full bg-gray-200/80"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
