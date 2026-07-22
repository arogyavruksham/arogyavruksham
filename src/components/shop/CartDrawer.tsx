'use client'

import { useCartStore } from '@/store/cartStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity } = useCartStore()
  const [mounted, setMounted] = useState(false)
  
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

            {/* Mobile Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-gray-50/50">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-400">
                  <p className="font-sans">Your cart is currently empty.</p>
                  <button 
                    onClick={() => setCartOpen(false)}
                    className="text-[#1A1F36] font-bold"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 p-2 shadow-sm border border-gray-50">
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80'} 
                        alt={item.title}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <h3 className="font-sans text-sm font-bold text-[#1A1F36] leading-snug mb-1">
                        {item.title}
                      </h3>
                      <div className="text-xs text-gray-500 mb-2 space-y-0.5">
                        <p>Category: <span className="font-medium text-gray-700">{item.category || 'Plant'}</span></p>
                      </div>
                      
                      <p className="font-sans font-bold text-sm text-[#1A1F36] mb-auto">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-sans text-sm font-bold text-[#1A1F36]">
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
                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Mobile Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-gray-50/50 flex flex-col mt-auto pb-safe">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Sub Total</span>
                    <span className="font-bold text-[#1A1F36]">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span className="font-bold text-[#1A1F36]">₹500</span>
                  </div>
                  <div className="flex justify-between items-center text-base pt-2 border-t border-gray-200">
                    <span className="font-bold text-[#1A1F36]">Total</span>
                    <span className="font-bold text-[#1A1F36]">₹{(subtotal + 500).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false)
                    window.location.href = '/checkout'
                  }}
                  className="w-full py-4 bg-[#0A102C] text-white text-center font-sans font-bold text-base rounded-xl hover:bg-[#1A204C] transition-colors"
                >
                  CHECKOUT
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
