'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Heart, Share2, Star, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { ProductCard } from './ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'

export function ProductDetailsClient({ product, children }: { product: any, children?: React.ReactNode }) {
  const router = useRouter()
  const { addItem, toggleCart } = useCartStore()
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [quantity, setQuantity] = useState(1)
  
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('*, users(full_name)')
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
      
      if (data) setReviews(data)
      setLoadingReviews(false)

      const channelName = `reviews_${product.id}_${Date.now()}`
      const channel = supabase.channel(channelName)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_reviews', filter: `product_id=eq.${product.id}` }, async () => {
          const { data: newData } = await supabase
            .from('product_reviews')
            .select('*, users(full_name)')
            .eq('product_id', product.id)
            .order('created_at', { ascending: false })
          if (newData) setReviews(newData)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    fetchReviews()
  }, [product.id])

  const averageRating = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : 0
  
  // Animation state
  const [flyingImage, setFlyingImage] = useState<{ id: number, x: number, y: number, targetX: number, targetY: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const mobileButtonRef = useRef<HTMLButtonElement>(null)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this beautiful ${product.category} plant!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  const triggerFlyAnimation = (isMobile: boolean) => {
    const btn = isMobile ? mobileButtonRef.current : buttonRef.current
    if (!btn) return

    const btnRect = btn.getBoundingClientRect()
    
    // Find target (cart icon)
    const targetId = isMobile ? 'mobile-cart-icon' : 'nav-cart-icon'
    const targetEl = document.getElementById(targetId)
    
    let targetX = window.innerWidth - 40 // fallback
    let targetY = 20 // fallback

    if (targetEl) {
      const targetRect = targetEl.getBoundingClientRect()
      targetX = targetRect.left + targetRect.width / 2
      targetY = targetRect.top + targetRect.height / 2
    }

    const startX = btnRect.left + btnRect.width / 2
    const startY = btnRect.top + btnRect.height / 2

    const newFlyingImage = {
      id: Date.now(),
      x: startX,
      y: startY,
      targetX,
      targetY
    }

    setFlyingImage(newFlyingImage)

    // Remove animation element after it completes
    setTimeout(() => {
      setFlyingImage(null)
    }, 800)
  }

  const handleAddToCart = (isMobile: boolean = false) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      imageUrl: product.image_url,
      category: product.category,
      stock_count: product.stock_count,
    }, isMobile) // only open cart menu automatically on mobile
    
    triggerFlyAnimation(isMobile)
  }

  const handleBuyNow = (isMobile: boolean = false) => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      quantity: quantity,
      imageUrl: product.image_url,
      category: product.category,
      stock_count: product.stock_count,
    }, false) // never open cart drawer on "Buy Now"
    
    router.push('/checkout')
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80';

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 md:bg-white relative md:static">
      
      {/* FLYING IMAGE ANIMATION */}
      <AnimatePresence>
        {flyingImage && (
          <motion.img
            key={flyingImage.id}
            src={product.image_url || fallbackImage}
            className="fixed z-[100] w-16 h-16 object-cover rounded-md shadow-2xl pointer-events-none"
            initial={{ 
              x: flyingImage.x - 32, 
              y: flyingImage.y - 32,
              scale: 1,
              opacity: 1
            }}
            animate={{ 
              x: flyingImage.targetX - 16, 
              y: flyingImage.targetY - 16,
              scale: 0.2,
              opacity: 0.5
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.7, 
              ease: "easeInOut" 
            }}
          />
        )}
      </AnimatePresence>



      {/* MOBILE LAYOUT (md:hidden) */}
      <div className="md:hidden flex flex-col w-full">
        <div className="relative w-full aspect-[4/5] overflow-hidden bg-white">
          {/* MOBILE TOP NAV INSIDE IMAGE */}
          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between p-4 px-6 pointer-events-none">
            <button 
              onClick={() => router.back()} 
              className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6 text-gray-900" />
            </button>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm pointer-events-auto transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} />
              </button>
              <button 
                onClick={handleShare}
                className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm pointer-events-auto"
              >
                <Share2 className="w-5 h-5 text-gray-900" />
              </button>
            </div>
          </div>

          <img 
            src={product.image_url || fallbackImage} 
            alt={product.title}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-2 h-2 rounded-full bg-gray-900"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
        </div>
        
        <div className="flex flex-col p-6 bg-white rounded-t-3xl -mt-6 relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="font-sans text-xl font-bold text-[#1A1F36] leading-tight mb-1">
                {product.title}
              </h1>
              <p className="text-xs text-gray-500 italic">
                by Arogyavruksham Silks
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="font-sans text-2xl font-bold text-[#212121]">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-gray-500 line-through font-medium text-lg">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </p>
              )}
              {product.original_price && product.original_price > product.price && (
                <span className="text-[#388e3c] font-bold text-lg">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 mb-6">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-[#1A1F36]">{averageRating || 'New'}</span>
            <span className="text-sm text-gray-400">({reviews.length} reviews)</span>
            <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 ml-1" />
          </div>

          <div className="w-full h-px bg-gray-100 mb-2"></div>

          <button className="flex items-center justify-between w-full py-4 text-[#1A1F36]">
            <span className="font-sans font-bold text-sm">Details</span>
            <Plus className="w-5 h-5 text-[#1A1F36]" />
          </button>

          <p className="font-sans text-sm text-gray-500 leading-relaxed mb-6">
            {product.description || 'Experience the luxury and elegance of this premium Indian plant, handwoven with authentic traditional techniques. Perfect for your next special occasion.'}
          </p>

          <div className="w-full h-px bg-gray-100 mb-6"></div>

          {/* MOBILE ADD TO CART (Normal Flow) */}
          <div className="flex gap-3 mb-8">
            <button 
              ref={mobileButtonRef}
              onClick={() => handleAddToCart(true)}
              className="flex-1 bg-[#E23F33] hover:bg-[#c93226] text-white font-bold py-3 rounded-md transition-colors text-sm uppercase tracking-wide"
            >
              Add to Cart
            </button>
            <button 
              onClick={() => handleBuyNow(true)}
              className="flex-1 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold py-3 rounded-md transition-colors text-sm uppercase tracking-wide"
            >
              Buy Now
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">Share</span>
            <Share2 className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#E23F33]" onClick={handleShare} />
            <svg className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            <svg className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
            <svg className="w-5 h-5 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
          </div>
          </div>
        </div>

      {/* DESKTOP LAYOUT (hidden md:block) */}
      <div className="hidden md:block container mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-12">
        <div className="grid grid-cols-2 gap-12 lg:gap-24">
          {/* Image Gallery */}
          <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 w-full relative group">
            <img 
              src={product.image_url || fallbackImage} 
              alt={product.title}
              className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          
          {/* Product Info */}
          <div className="flex flex-col justify-center">
            <span className="text-gray-500 font-sans font-bold tracking-wider uppercase text-sm mb-2">{product.category || 'Plant'}</span>
            <h1 className="font-serif text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-lg font-bold text-gray-900">{averageRating || 'New'}</span>
              <span className="text-gray-500">({reviews.length} customer reviews)</span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <p className="font-sans text-4xl text-[#212121] font-bold">
                ₹{product.price.toLocaleString('en-IN')}
              </p>
              {product.original_price && product.original_price > product.price && (
                <p className="text-gray-500 line-through font-medium text-2xl">
                  ₹{product.original_price.toLocaleString('en-IN')}
                </p>
              )}
              {product.original_price && product.original_price > product.price && (
                <span className="text-[#388e3c] font-bold text-2xl">
                  {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% off
                </span>
              )}
            </div>
            
            <div className="w-full h-px bg-gray-200 mb-6"></div>
            
            <p className="font-sans text-gray-600 leading-relaxed mb-8 text-lg">
              {product.description || 'Inspired by peacock feathers, this rich green and blue dual-tone silk plant is a masterpiece of weaving.'}
            </p>
            
            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-gray-600 text-lg">Quantity</span>
              <select 
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="border border-gray-300 rounded-md py-1.5 px-3 text-lg focus:outline-none focus:ring-1 focus:ring-[#1A73E8]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <option key={n} value={n}>{n.toString().padStart(2, '0')}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-4 mb-8">
              <button 
                ref={buttonRef}
                onClick={() => handleAddToCart(false)}
                className="flex-1 bg-[#E23F33] hover:bg-[#c93226] text-white font-bold py-3.5 rounded-md transition-colors text-lg tracking-wide uppercase"
              >
                Add to Cart
              </button>
              <button 
                onClick={() => handleBuyNow(false)}
                className="flex-1 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-bold py-3.5 rounded-md transition-colors text-lg tracking-wide uppercase"
              >
                Buy Now
              </button>
            </div>

            {/* Social Share */}
            <div className="flex items-center gap-4">
              <span className="text-gray-600 text-lg mr-2">Share</span>
              <Share2 className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#E23F33]" onClick={handleShare} />
              <svg className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              <svg className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              <svg className="w-6 h-6 text-gray-600 cursor-pointer hover:text-[#E23F33]" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </div>

          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-white border-t border-gray-100 md:border-none">
        <h2 className="font-serif text-3xl font-bold text-gray-900 mb-8 text-center md:text-left">Customer Reviews</h2>
        
        {loadingReviews ? (
          <div className="flex justify-center"><div className="w-8 h-8 border-4 border-[#1A73E8] border-t-transparent rounded-full animate-spin"></div></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">No reviews yet. Be the first to review this product after purchase!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-200'}`} />
                  ))}
                </div>
                {review.review_text && (
                  <p className="text-gray-700 italic mb-4">"{review.review_text}"</p>
                )}
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-200">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#1A73E8] font-bold shadow-sm border border-gray-100">
                    {review.users?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{review.users?.full_name || 'Anonymous User'}</p>
                    <p className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MORE PRODUCTS SECTION (visible on both mobile and desktop) */}
      {children}

    </div>
  )
}
