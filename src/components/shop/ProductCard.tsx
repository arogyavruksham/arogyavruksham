'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface ProductCardProps {
  id: string
  title: string
  price: number
  original_price?: number
  category: string
  imageUrl?: string | null
  stock_count?: number
}

export function ProductCard({ id, title, price, original_price, category, imageUrl, stock_count }: ProductCardProps) {
  const fallbackImage = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'
  const isOutOfStock = stock_count !== undefined && stock_count <= 0;
  
  return (
    <>
      {/* MOBILE LAYOUT (md:hidden) */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="group bg-white overflow-hidden flex flex-col md:hidden"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3 rounded-2xl flex items-center justify-center p-1">
          {/* Heart Icon */}
          <button className="absolute top-3 right-3 p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
              <div className="bg-red-600 text-white px-3 py-1 font-bold text-xs uppercase tracking-wider rounded shadow-md">
                Out of Stock
              </div>
            </div>
          )}
          
          <Link href={`/shop/${id}`} className="block w-full h-full">
            <img 
              src={imageUrl || fallbackImage} 
              alt={title}
              onError={(e) => { e.currentTarget.src = fallbackImage; }}
              className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply ${!isOutOfStock && 'group-hover:scale-105'} ${isOutOfStock && 'opacity-60 grayscale-[50%]'}`}
            />
          </Link>
        </div>
        
        <div className="px-1 flex flex-col flex-1">
          <Link href={`/shop/${id}`} className="flex flex-col h-full">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-[#1A1F36] leading-tight line-clamp-1 mb-0.5">
              {title}
            </h3>
            <span className="text-[10px] sm:text-xs text-gray-500 italic mb-2">
              by Arogyavruksham
            </span>
            <div className="flex items-center gap-1.5 mt-auto">
              <p className="font-sans font-bold text-sm text-[#212121]">
                ₹{price.toLocaleString('en-IN')}
              </p>
              {original_price && original_price > price && (
                <p className="text-[11px] text-gray-500 line-through font-medium">
                  ₹{original_price.toLocaleString('en-IN')}
                </p>
              )}
              {original_price && original_price > price && (
                <span className="text-[11px] font-bold text-[#388e3c]">
                  {Math.round(((original_price - price) / original_price) * 100)}% off
                </span>
              )}
            </div>
          </Link>
        </div>
      </motion.div>

      {/* DESKTOP LAYOUT (hidden md:flex) */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="group bg-white overflow-hidden hidden md:flex flex-col h-full"
      >
        <div className="relative aspect-square overflow-hidden bg-white mb-4 flex items-center justify-center">
          {/* NEW Badge */}
          {!isOutOfStock && (
            <div className="absolute top-2 left-2 bg-[#0066FF] text-white px-3 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-full z-10 tracking-wider shadow-sm">
              NEW
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-20 backdrop-blur-[1px]">
              <div className="bg-red-600 text-white px-4 py-1.5 font-bold text-sm uppercase tracking-widest rounded shadow-md border border-red-500">
                Out of Stock
              </div>
            </div>
          )}
          
          <Link href={`/shop/${id}`} className="block w-full h-full">
            <img 
              src={imageUrl || fallbackImage} 
              alt={title}
              onError={(e) => { e.currentTarget.src = fallbackImage; }}
              className={`w-full h-full object-contain transition-transform duration-500 mix-blend-multiply ${!isOutOfStock && 'group-hover:scale-105'} ${isOutOfStock && 'opacity-60 grayscale-[50%]'}`}
            />
          </Link>
          
          {/* Hover Action Buttons */}
          {!isOutOfStock && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-1 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
              <button 
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-[#648B3F] text-white flex items-center justify-center hover:bg-[#527431] transition-colors shadow-md"
                title="Add to Cart"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              <button 
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-[#EEEEEE] text-gray-600 flex items-center justify-center hover:text-[#1E4631] hover:bg-[#E5E5E5] transition-colors shadow-md"
                title="Add to Wishlist"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <button 
                onClick={(e) => e.preventDefault()}
                className="w-10 h-10 bg-[#EEEEEE] text-gray-600 flex items-center justify-center hover:text-[#1E4631] hover:bg-[#E5E5E5] transition-colors shadow-md"
                title="Quick View"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        
        <div className="px-1 flex flex-col flex-1">
          <Link href={`/shop/${id}`} className="flex flex-col h-full">
            <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 font-sans">
              AROGYAVRUKSHAM
            </span>
            <h3 className="font-sans text-xs sm:text-sm md:text-base font-bold text-gray-900 uppercase leading-snug line-clamp-2 hover:text-[#0A58FF] transition-colors flex-1 mb-2">
              {title}
            </h3>
            <div className="flex items-center gap-1.5 mt-auto">
              <p className="font-sans font-bold text-sm sm:text-base md:text-lg text-[#212121]">
                ₹{price.toLocaleString('en-IN')}
              </p>
              {original_price && original_price > price && (
                <p className="text-xs sm:text-sm text-gray-500 line-through font-medium">
                  ₹{original_price.toLocaleString('en-IN')}
                </p>
              )}
              {original_price && original_price > price && (
                <span className="text-xs sm:text-sm font-bold text-[#388e3c]">
                  {Math.round(((original_price - price) / original_price) * 100)}% off
                </span>
              )}
            </div>
          </Link>
        </div>
      </motion.div>
    </>
  )
}
