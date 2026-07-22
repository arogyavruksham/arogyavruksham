'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X, Package, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function ReviewPromptModal() {
  const { user, isAuthenticated } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)
  const [unreviewedItem, setUnreviewedItem] = useState<any>(null)
  
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const checkUnreviewedItems = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) return;

        // 1. Get all delivered orders for the user
        const { data: orders } = await supabase
          .from('orders')
          .select('id, status')
          .eq('user_id', authUser.id)
          .eq('status', 'delivered');

        if (!orders || orders.length === 0) return;
        
        const orderIds = orders.map(o => o.id);

        // 2. Get all order items from those delivered orders
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('*, products(*)')
          .in('order_id', orderIds);

        if (!orderItems || orderItems.length === 0) return;

        // 3. Get all existing reviews by this user
        const { data: existingReviews } = await supabase
          .from('product_reviews')
          .select('order_id, product_id')
          .eq('user_id', authUser.id);

        const reviewSet = new Set(existingReviews?.map(r => `${r.order_id}-${r.product_id}`) || []);

        // 4. Find the first item that hasn't been reviewed
        // Also check localStorage for dismissed items to avoid spamming
        const dismissedKey = `dismissed_reviews_${authUser.id}`;
        const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
        
        const itemToReview = orderItems.find(item => {
          const key = `${item.order_id}-${item.product_id}`;
          return !reviewSet.has(key) && !dismissed.includes(key);
        });

        if (itemToReview) {
          setUnreviewedItem(itemToReview);
          // Small delay so it doesn't pop up too aggressively on page load
          setTimeout(() => setIsOpen(true), 1500);
        }

      } catch (error) {
        console.error('Error checking for unreviewed items:', error);
      }
    };

    checkUnreviewedItems();
  }, [isAuthenticated, user]);

  const handleDismiss = async () => {
    if (!unreviewedItem) return;
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    const key = `${unreviewedItem.order_id}-${unreviewedItem.product_id}`;
    const dismissedKey = `dismissed_reviews_${authUser.id}`;
    const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || '[]');
    
    if (!dismissed.includes(key)) {
      dismissed.push(key);
      localStorage.setItem(dismissedKey, JSON.stringify(dismissed));
    }
    
    setIsOpen(false);
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || !unreviewedItem) return;
    
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('product_reviews').insert({
        user_id: authUser.id,
        order_id: unreviewedItem.order_id,
        product_id: unreviewedItem.product_id,
        rating,
        review_text: reviewText.trim() || null
      });

      if (!error) {
        setIsOpen(false);
        // Optionally trigger a toast or success message here
      } else {
        console.error("Failed to submit review:", error);
        alert(`Failed to submit review: ${error.message || JSON.stringify(error)}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !unreviewedItem) return null;

  const product = unreviewedItem.products;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#1A73E8] p-6 text-white text-center relative">
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md border border-white/30">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold font-serif mb-1">Your Order Was Delivered!</h2>
            <p className="text-blue-100 text-sm">How do you like your new product?</p>
          </div>

          {/* Body */}
          <div className="p-6 text-center">
            {/* Product Info */}
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl mb-6 border border-gray-100 text-left">
              <div className="w-16 h-16 bg-white rounded-xl overflow-hidden shrink-0 border border-gray-200">
                {product?.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover mix-blend-multiply" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{product?.title || 'Unknown Product'}</p>
                <p className="text-xs text-gray-500 mt-1">Purchased recently</p>
              </div>
            </div>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                >
                  <Star 
                    className={`w-10 h-10 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? 'fill-[#FFB800] text-[#FFB800]' 
                        : 'text-gray-200'
                    }`} 
                  />
                </button>
              ))}
            </div>

            {/* Feedback Text */}
            <AnimatePresence>
              {rating > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className="mb-6 overflow-hidden"
                >
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell us more about your experience (optional)..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A73E8] focus:ring-1 focus:ring-[#1A73E8] resize-none h-24"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={handleDismiss}
                className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Not Now
              </button>
              <button 
                disabled={rating === 0 || isSubmitting}
                onClick={handleSubmitReview}
                className="flex-1 py-3 text-sm font-bold text-white bg-[#1A73E8] hover:bg-blue-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting</>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
