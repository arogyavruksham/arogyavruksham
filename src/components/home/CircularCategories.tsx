'use client'

import Link from 'next/link'
import { ChevronRight, Sparkles } from 'lucide-react'
import { useCategories } from '@/lib/categories'
import { useState } from 'react'

export function CircularCategories() {
  const categories = useCategories()
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({})

  return (
    <section className="py-8 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#51D3B7] flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Curated Collections
            </span>
            <h2 className="font-serif text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-[#FF6B35] font-bold hover:underline text-xs flex items-center gap-1">
            See All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="relative">
          <div className="flex gap-6 sm:gap-8 overflow-x-auto pb-4 scrollbar-hide snap-x pt-2 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((category, index) => {
              const isFailed = failedImages[category.slug || category.name]
              const linkUrl = `/shop?category=${encodeURIComponent(category.slug || category.name)}`

              return (
                <Link 
                  key={index} 
                  href={linkUrl}
                  className="flex flex-col items-center gap-3 shrink-0 snap-start group w-24 sm:w-32"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gradient-to-tr from-[#51D3B7]/20 via-pink-100 to-amber-100 border-2 border-gray-100 shadow-sm p-1 group-hover:border-[#51D3B7] group-hover:shadow-md transition-all duration-300">
                    <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 relative flex items-center justify-center">
                      {!isFailed && category.image ? (
                        <img 
                          src={category.image} 
                          alt="" 
                          onError={() => setFailedImages(prev => ({ ...prev, [category.slug || category.name]: true }))}
                          className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-2 text-center">
                          <span className="text-white font-serif font-bold text-xs sm:text-sm tracking-wider uppercase drop-shadow">
                            {category.name.slice(0, 10)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-sans text-xs sm:text-sm font-bold text-gray-800 group-hover:text-[#51D3B7] transition-colors text-center truncate w-full px-1">
                    {category.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
