'use client'

import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useHardwareBack } from '@/hooks/useHardwareBack'

export function CartDrawer() {
  const router = useRouter()
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCartStore()
  const [mounted, setMounted] = useState(false)
  
  // Intercept mobile hardware back button to close cart drawer
  useHardwareBack(isOpen, () => setCartOpen(false), 'cart')
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (Shared) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* DESKTOP DRAWER (hidden md:flex) */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background shadow-2xl hidden md:flex flex-col"
          >
            {/* Desktop Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-sans text-[22px] font-bold text-black uppercase tracking-wide">
                YOUR CART ({items.length})
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="text-black hover:text-gray-600 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Desktop Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-400">
                  <p className="font-sans">Your cart is currently empty.</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="text-black font-bold uppercase underline underline-offset-4"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-6 pb-6 border-b border-gray-100 last:border-0">
                    <div className="w-24 h-24 bg-white flex items-center justify-center flex-shrink-0">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80'} 
                        alt={item.title}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex flex-col mb-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 font-sans">
                          AROGYAVRUKSHAM SILKS
                        </span>
                        <h3 className="font-sans text-xs font-bold text-black uppercase leading-snug line-clamp-2">
                          {item.title}
                        </h3>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-sans font-bold text-sm text-black">
                          Rs. {item.price.toLocaleString('en-IN')}.00
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-black h-8 w-24 flex-shrink-0">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="flex-1 flex justify-center items-center h-full text-black hover:bg-gray-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-sans text-xs font-medium text-[#0A58FF]">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="flex-1 flex justify-center items-center h-full text-black hover:bg-gray-100"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-white flex flex-col gap-4 mt-auto border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="font-sans text-sm font-bold text-black uppercase tracking-wide">SUBTOTAL</span>
                  <span className="font-sans text-sm font-bold text-black">Rs. {subtotal.toLocaleString('en-IN')}.00</span>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false)
                    window.location.href = '/checkout'
                  }}
                  className="w-full py-4 bg-[#1c1b1b] text-white text-center font-sans font-bold text-sm tracking-widest uppercase hover:bg-black transition-colors"
                >
                  CHECKOUT
                </button>

                <Link
                  href="/cart"
                  onClick={() => setCartOpen(false)}
                  className="w-full text-center font-sans font-bold text-[13px] tracking-wide text-black uppercase underline underline-offset-4 decoration-2 hover:text-gray-600 transition-colors mt-2"
                >
                  VIEW MY CART
                </Link>
              </div>
            )}
          </motion.div>


          {/* MOBILE DRAWER (md:hidden) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 w-full h-full bg-background flex flex-col md:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center gap-4 p-6 border-b border-gray-100 pt-10 pb-safe-top">
              <button
                onClick={() => setCartOpen(false)}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-50 text-gray-900"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="font-sans text-xl font-bold text-[#1A1F36]">
                Cart
              </h2>
            </div>

            {/* Mobile Cart Content (Fully Scrollable with BottomNav clearance) */}
            <div className="flex-1 overflow-y-auto px-5 py-4 pb-[135px] sm:pb-[145px] bg-white flex flex-col justify-between">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full my-auto py-20 text-center space-y-4 text-gray-500">
                  <p className="font-sans font-medium text-[15px]">Your cart is currently empty.</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="px-8 py-3.5 bg-[#11311F] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#11311F]/20 hover:bg-black transition-all active:scale-95"
                  >
                    Explore Collection
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-24 h-28 bg-[#F6F9F7] rounded-xl flex items-center justify-center flex-shrink-0 p-2 border border-[#E9F3ED]">
                          <img 
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80'} 
                            alt={item.title}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
                          <div>
                            <h3 className="font-sans text-[15px] font-bold text-[#11311F] leading-snug line-clamp-2">
                              {item.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">Category: <span className="font-medium text-[#235839]">{item.category || 'Indoor Plants'}</span></p>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 pt-1">
                            <span className="font-sans font-bold text-lg text-[#11311F]">
                              ₹{item.price.toLocaleString('en-IN')}
                            </span>

                            <div className="flex items-center gap-2">
                              <div className="flex items-center rounded-full bg-[#F6F9F7] border border-[#E9F3ED]">
                                <button 
                                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#11311F] hover:bg-[#E9F3ED] transition-all"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-6 text-center font-sans text-[13px] font-bold text-[#11311F]">
                                  {item.quantity}
                                </span>
                                <button 
                                  onClick={() => {
                                    if (item.quantity < (item.stock_count || 100)) {
                                      updateQuantity(item.id, item.quantity + 1)
                                    } else {
                                      alert(`Only ${item.stock_count} items available in stock.`)
                                    }
                                  }} 
                                  className="w-7 h-7 flex items-center justify-center rounded-full text-[#11311F] hover:bg-[#E9F3ED] transition-all"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <button 
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile Footer & Price Breakdown */}
                  <div className="mt-6 bg-[#F6F9F7] p-5 rounded-2xl border border-[#E9F3ED] space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="text-gray-500 font-medium">Sub Total</span>
                        <span className="font-bold text-[#11311F]">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[15px]">
                        <span className="text-gray-500 font-medium">Shipping</span>
                        <span className="font-bold text-[#11311F]">₹500</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-[#E9F3ED] mt-2">
                        <span className="font-bold text-[#11311F] text-lg">Total</span>
                        <span className="font-black text-xl text-[#11311F]">₹{(subtotal + 500).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCartOpen(false)
                        router.push('/checkout')
                      }}
                      className="w-full py-4 bg-[#11311F] hover:bg-black text-white text-center font-sans font-bold text-[15px] rounded-xl shadow-xl shadow-[#11311F]/20 transition-transform duration-200 active:scale-95 block"
                    >
                      PROCEED TO CHECKOUT &rarr;
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
