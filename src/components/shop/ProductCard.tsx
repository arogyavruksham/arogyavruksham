'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Heart, 
  Search, 
  Check, 
  X, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  ShoppingBag
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'

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
  const router = useRouter()
  const { addItem } = useCartStore()
  const { toggleItem, isInWishlist } = useWishlistStore()
  
  const [addedToCart, setAddedToCart] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const [quickViewQty, setQuickViewQty] = useState(1)
  const [toastMessage, setToastMessage] = useState('')

  const fallbackImage = 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop'
  const isOutOfStock = stock_count !== undefined && stock_count <= 0
  const isWishlisted = isInWishlist(id)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  // 1. ADD TO CART HANDLER
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return

    addItem({
      id,
      title,
      price: Number(price),
      imageUrl: imageUrl || fallbackImage,
      stock_count,
      category,
      quantity: 1, // Explicit 1 prevents NaN bugs
    }, true)

    setAddedToCart(true)
    showToast('Added to Cart!')
    setTimeout(() => setAddedToCart(false), 2000)
  }

  // 2. WISHLIST HANDLER
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const added = toggleItem({
      id,
      title,
      price: Number(price),
      imageUrl: imageUrl || fallbackImage,
      category,
    })

    showToast(added ? 'Added to Wishlist ❤️' : 'Removed from Wishlist')
  }

  // 3. QUICK VIEW HANDLER
  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewQty(1)
    setShowQuickView(true)
  }

  // QUICK VIEW: ADD TO CART
  const handleQuickViewAddToCart = () => {
    if (isOutOfStock) return
    addItem({
      id,
      title,
      price: Number(price),
      imageUrl: imageUrl || fallbackImage,
      stock_count,
      category,
      quantity: quickViewQty,
    }, true)
    setShowQuickView(false)
    showToast(`Added ${quickViewQty} item(s) to Cart!`)
  }

  // QUICK VIEW: BUY NOW
  const handleQuickViewBuyNow = () => {
    if (isOutOfStock) return
    addItem({
      id,
      title,
      price: Number(price),
      imageUrl: imageUrl || fallbackImage,
      stock_count,
      category,
      quantity: quickViewQty,
    }, false)
    setShowQuickView(false)
    router.push('/checkout')
  }

  return (
    <>
      {/* ═══ FLOATING TOAST ═══ */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[80] pointer-events-none animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="bg-[#11311F] text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl border border-emerald-400/30 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* ═══ MOBILE LAYOUT (md:hidden) ═══ */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="group bg-white overflow-hidden flex flex-col md:hidden relative"
      >
        <div className="relative aspect-square overflow-hidden bg-gray-50 mb-3 rounded-2xl flex items-center justify-center p-1">
          {/* Heart Icon (Mobile) */}
          <button 
            onClick={handleToggleWishlist}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors z-10 cursor-pointer"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
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

      {/* ═══ DESKTOP LAYOUT (hidden md:flex) ═══ */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="group bg-white overflow-hidden hidden md:flex flex-col h-full relative"
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
          
          {/* ── 3 HOVER ACTION BUTTONS (WORKING) ── */}
          {!isOutOfStock && (
            <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-1.5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 pointer-events-none group-hover:pointer-events-auto">
              {/* 1. Add to Cart Button */}
              <button 
                onClick={handleAddToCart}
                className={`w-10 h-10 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer rounded-sm ${
                  addedToCart ? 'bg-[#11311F] scale-105' : 'bg-[#648B3F] hover:bg-[#527431]'
                } text-white`}
                title="Add to Cart"
              >
                {addedToCart ? (
                  <Check className="w-5 h-5 text-white animate-in zoom-in-50" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )}
              </button>

              {/* 2. Add to Wishlist Button */}
              <button 
                onClick={handleToggleWishlist}
                className="w-10 h-10 bg-[#EEEEEE] text-gray-600 flex items-center justify-center hover:text-red-500 hover:bg-[#E5E5E5] transition-all duration-200 shadow-md cursor-pointer rounded-sm"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart className={`w-5 h-5 transition-transform active:scale-125 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </button>

              {/* 3. Quick View / Search Button */}
              <button 
                onClick={handleQuickView}
                className="w-10 h-10 bg-[#EEEEEE] text-gray-600 flex items-center justify-center hover:text-[#1E4631] hover:bg-[#E5E5E5] transition-all duration-200 shadow-md cursor-pointer rounded-sm"
                title="Quick View"
              >
                <Search className="w-5 h-5" />
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

      {/* ═══ QUICK VIEW MODAL (MAGNIFYING GLASS) ═══ */}
      <AnimatePresence>
        {showQuickView && (
          <div 
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowQuickView(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-emerald-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setShowQuickView(false)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Product Image */}
                <div className="relative aspect-square rounded-2xl bg-[#FAFAF8] border border-emerald-100/60 p-6 flex items-center justify-center overflow-hidden">
                  <img 
                    src={imageUrl || fallbackImage} 
                    alt={title}
                    className="w-full h-full object-contain mix-blend-multiply transition-transform hover:scale-110 duration-500" 
                  />
                  {original_price && original_price > price && (
                    <span className="absolute top-3 left-3 bg-[#D27D56] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Sale {Math.round(((original_price - price) / original_price) * 100)}% Off
                    </span>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">
                      Arogyavruksham Botanical Nursery
                    </span>
                    <h3 className="font-serif font-black text-2xl text-[#11311F] leading-tight mb-2">
                      {title}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium mb-4">
                      Category: <span className="text-emerald-700 font-bold capitalize">{category || 'Indoor Plant'}</span>
                    </p>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2.5 mb-5 pb-5 border-b border-gray-100">
                      <span className="font-serif font-black text-3xl text-[#11311F]">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                      {original_price && original_price > price && (
                        <span className="text-sm text-gray-400 line-through font-medium">
                          ₹{original_price.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Qty:</span>
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                        <button 
                          onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                          className="px-3 py-1.5 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-4 font-bold text-sm text-[#11311F]">
                          {quickViewQty}
                        </span>
                        <button 
                          onClick={() => setQuickViewQty(quickViewQty + 1)}
                          className="px-3 py-1.5 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2.5">
                    <button 
                      onClick={handleQuickViewAddToCart}
                      className="w-full py-3.5 bg-[#11311F] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </button>
                    <button 
                      onClick={handleQuickViewBuyNow}
                      className="w-full py-3 bg-[#648B3F] text-white rounded-2xl font-bold text-xs uppercase tracking-wider hover:bg-[#527431] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      Instant Buy Now
                    </button>
                    <Link
                      href={`/shop/${id}`}
                      onClick={() => setShowQuickView(false)}
                      className="block text-center text-xs font-bold text-emerald-800 hover:underline pt-1"
                    >
                      View Full Botanical Specifications →
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
