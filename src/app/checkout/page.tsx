'use client'

import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Minus, Plus, Trash2, ShoppingCart, MapPin, CreditCard, Check, Tag, Loader2, ChevronLeft, Lock, Heart, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CheckoutPage() {
  const { items, clearCart, updateQuantity, removeItem, appliedCoupon, applyCoupon } = useCartStore()
  const { isAuthenticated, setAuthModalOpen, logout } = useAuthStore()
  const router = useRouter()

  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'cod'>('online')

  // Coupon state
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')
  const [errorModal, setErrorModal] = useState('')

  // Address State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addressData, setAddressData] = useState({
    name: '', email: '', phone: '', pincode: '', state: '', city: '', fullAddress: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function fetchAddresses() {
      if (isAuthenticated && step === 2) {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('user_addresses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
          
          if (data && data.length > 0) {
            setSavedAddresses(data)
            const defaultAddr = data.find(a => a.is_default) || data[0]
            setSelectedAddressId(defaultAddr.id)
            setAddressData({
              name: defaultAddr.name, email: defaultAddr.email || '', phone: defaultAddr.phone,
              pincode: defaultAddr.pincode, state: defaultAddr.state, city: defaultAddr.city, fullAddress: defaultAddr.fullAddress
            })
            setShowAddAddress(false)
          } else {
            setShowAddAddress(true)
          }
        }
      }
    }
    fetchAddresses()
  }, [isAuthenticated, step])

  if (!mounted) return null

  // If cart is empty and on step 1, show empty state
  if (items.length === 0 && step === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-6 pt-20">
        <ShoppingCart className="w-20 h-20 text-gray-300" />
        <h1 className="text-3xl font-bold text-gray-900 font-serif">Your Cart is Empty</h1>
        <button onClick={() => router.push('/shop')} className="bg-[#1A73E8] text-white px-8 py-3 rounded-lg font-bold">
          Continue Shopping
        </button>
      </div>
    )
  }

  // Pricing calculations
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 20000 ? 0 : 500
  let discountAmount = 0
  if (appliedCoupon) {
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (subtotal * appliedCoupon.discount_value) / 100
    } else {
      discountAmount = appliedCoupon.discount_value
    }
  }
  const tax = 0
  const total = Math.max(0, subtotal - discountAmount + shipping + tax)

  const handleApplyCoupon = async () => {
    setCouponError('')
    setCouponSuccess('')
    if (!couponInput.trim()) return

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponInput.trim().toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !data) {
        setCouponError('Invalid or inactive coupon code.')
        return
      }

      const now = Date.now()
      const start = new Date(data.start_date).getTime()
      const end = new Date(data.expiry_date).getTime()

      if (now < start) {
        setCouponError('This coupon is not active yet.')
        return
      }
      if (now > end) {
        setCouponError('This coupon has expired.')
        return
      }

      applyCoupon({ code: data.code, discount_type: data.discount_type, discount_value: data.discount_value })
      setCouponInput('')
      setCouponSuccess('Coupon applied successfully!')
    } catch (err) {
      setCouponError('Error applying coupon.')
    }
  }

  const handleSaveAddress = async () => {
    setIsProcessing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setAuthModalOpen(true)
      setIsProcessing(false)
      return
    }

    const { data: newAddr, error } = await supabase.from('user_addresses').insert({
      user_id: user.id,
      name: addressData.name,
      email: addressData.email,
      phone: addressData.phone,
      fullAddress: addressData.fullAddress,
      city: addressData.city,
      state: addressData.state,
      pincode: addressData.pincode,
      is_default: savedAddresses.length === 0
    }).select().single()

    if (newAddr) {
      setSavedAddresses([newAddr, ...savedAddresses])
      setSelectedAddressId(newAddr.id)
      setShowAddAddress(false)
    } else {
      setErrorModal('Failed to save address.')
    }
    setIsProcessing(false)
  }

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true)
      return
    }

    setIsProcessing(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        try {
          const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              total,
              items,
              addressData,
              appliedCoupon,
              discountAmount,
              paymentMethod
            })
          })

          const result = await res.json()

          if (!res.ok) {
            console.error("Checkout API Failed:", result.error)
            const isUserSyncIssue = 
              result.error?.includes('foreign key') ||
              result.error?.includes('not present in table "users"');

            if (isUserSyncIssue) {
              logout()
              setErrorModal("Your account is out of sync with the database. You have been automatically logged out. Please Sign Up for a NEW account to continue placing orders.")
              router.push('/login')
              return
            }
            
            throw new Error(`We encountered a database error: ${result.error}`);
          }
        } catch (dbErr) {
          console.error("DB Operations Failed:", dbErr)
          throw dbErr
        }
      }

      // Simulate a dummy payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      clearCart()
      setPaymentSuccess(true)
      
      setTimeout(() => {
        router.push('/profile')
      }, 4000)
      
    } catch (error: any) {
      console.error(error)
      setErrorModal(error?.message || 'There was an error processing your order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const proceedToNextStep = () => {
    if (step === 1) {
      const hasOutOfStock = items.some(item => item.stock_count !== undefined && item.stock_count < item.quantity);
      if (hasOutOfStock) {
        setErrorModal('Some items in your cart are out of stock or have insufficient quantity. Please remove them or adjust the quantity to proceed.');
        return;
      }
      if (!isAuthenticated) setAuthModalOpen(true)
      else setStep(2)
    } else if (step === 2) {
      if (selectedAddressId) setStep(3)
      else setErrorModal('Please select or add a shipping address.')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-32">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Mobile Top Header */}
      <div className="bg-[#FAFAFA] pt-6 pb-4 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()}><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
            <img src="/logo.png" alt="Arogyavruksham Silks" className="max-h-24 max-w-[280px] scale-125 origin-left object-contain py-1" />
          </div>
          <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
            <Lock className="w-3.5 h-3.5" /> Secure Checkout
          </div>
        </div>

        <h1 className="font-serif text-3xl font-bold text-gray-900 mb-1">Checkout</h1>
        <p className="text-sm text-gray-600 font-medium mb-6">
          {step} of 3 • <span className="text-[#6D1B2D] font-bold">{step === 1 ? 'Cart' : step === 2 ? 'Shipping' : 'Payment'}</span>
        </p>

        {/* Stepper */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] px-6 py-5 flex items-center justify-between mb-8">
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setStep(1)}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-[#6D1B2D] text-white' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
              {step > 1 ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            </div>
            <span className={`text-[11px] font-bold ${step >= 1 ? 'text-[#6D1B2D]' : 'text-gray-500'}`}>Cart</span>
          </div>
          <div className={`h-px flex-1 mx-3 ${step >= 2 ? 'bg-[#6D1B2D]' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => { if(step > 1) setStep(2) }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-[#6D1B2D] text-white' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
              {step > 2 ? <Check className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
            </div>
            <span className={`text-[11px] font-bold ${step >= 2 ? 'text-[#6D1B2D]' : 'text-gray-500'}`}>Shipping</span>
          </div>
          <div className={`h-px flex-1 mx-3 ${step >= 3 ? 'bg-[#6D1B2D]' : 'bg-gray-200'}`}></div>
          <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => { if(step > 2) setStep(3) }}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step >= 3 ? 'bg-[#6D1B2D] text-white' : 'bg-gray-50 border border-gray-200 text-gray-400'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <span className={`text-[11px] font-bold ${step >= 3 ? 'text-[#6D1B2D]' : 'text-gray-500'}`}>Payment</span>
          </div>
        </div>

        {/* Step 1: Cart Content */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
              <h2 className="font-serif font-bold text-gray-900 mb-5 text-lg">Cart Items ({items.length})</h2>
              {items.map((item) => (
                <div key={item.id} className="flex flex-col mb-4 last:mb-0">
                  <div className="flex gap-4 pb-5 border-b border-gray-100">
                    <div className="w-24 h-32 bg-[#F5F5F5] rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-gray-100">
                      <img src={item.imageUrl || ''} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col py-1">
                      <h3 className="font-serif font-bold text-gray-900 leading-tight text-[15px]">{item.title}</h3>
                      <p className="font-bold text-gray-900 mt-2">₹{item.price.toLocaleString('en-IN')}</p>
                      {item.stock_count !== undefined && item.stock_count < item.quantity ? (
                        <p className="text-xs text-red-600 flex items-center gap-1.5 mt-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Out of stock
                        </p>
                      ) : (
                        <p className="text-xs text-green-600 flex items-center gap-1.5 mt-2 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> In stock
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center pt-4">
                    <button onClick={() => removeItem(item.id)} className="flex-1 flex items-center justify-center gap-2 text-xs text-[#6D1B2D] font-medium border-r border-gray-100">
                      <Trash2 className="w-4 h-4" /> Remove
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 text-xs text-[#6D1B2D] font-medium">
                      <Heart className="w-4 h-4" /> Save for later
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-5">
              <h2 className="font-serif font-bold text-gray-900 mb-4 text-lg">Discount Code</h2>
              {appliedCoupon ? (
                 <div className="flex justify-between items-center bg-green-50 border border-green-100 p-3 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-green-200 rounded p-1.5"><Tag className="w-4 h-4 text-green-600"/></div>
                    <div>
                      <p className="font-bold text-green-700 text-sm">{appliedCoupon.code}</p>
                    </div>
                  </div>
                  <button onClick={() => applyCoupon(null)} className="text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                </div>
              ) : (
                <>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200 h-[52px]">
                    <div className="pl-4 pr-2 flex items-center bg-white">
                      <Tag className="w-4 h-4 text-gray-400 rotate-90" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Enter coupon code" 
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="w-full px-2 outline-none text-sm text-gray-900 bg-white placeholder:text-gray-400" 
                    />
                    <button onClick={handleApplyCoupon} className="px-6 bg-[#F5F2F0] text-[#6D1B2D] font-bold text-sm hover:bg-[#eae4df] transition-colors">Apply</button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs font-medium mt-2 ml-1">{couponError}</p>}
                </>
              )}
            </div>

            {/* Price Details */}
            <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8">
              <h2 className="font-serif font-bold text-gray-900 mb-5 text-lg">Price Details</h2>
              <div className="space-y-4 text-sm font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-gray-900">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                </div>
              </div>
              <div className="w-full border-t border-dashed border-gray-200 my-5"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">Total <span className="text-[10px] text-gray-400 font-normal">(Inclusive of all taxes)</span></span>
                <span className="font-bold text-gray-900 text-lg">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 Content */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-serif text-xl font-bold text-gray-900">Shipping Address</h2>
              {!showAddAddress && (
                <button onClick={() => setShowAddAddress(true)} className="text-[#6D1B2D] font-bold text-sm">+ Add New Address</button>
              )}
            </div>

            {showAddAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                    <input type="text" value={addressData.name} onChange={e => setAddressData({...addressData, name: e.target.value})} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email</label>
                    <input type="email" value={addressData.email} onChange={e => setAddressData({...addressData, email: e.target.value})} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <input type="tel" maxLength={10} inputMode="numeric" value={addressData.phone} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (val.length <= 10) setAddressData({...addressData, phone: val})
                    }} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode</label>
                    <input type="text" maxLength={5} inputMode="numeric" value={addressData.pincode} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (val.length <= 5) setAddressData({...addressData, pincode: val})
                    }} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">State</label>
                    <input type="text" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
                    <input type="text" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full px-4 h-[44px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] text-black bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Address</label>
                  <textarea value={addressData.fullAddress} onChange={e => setAddressData({...addressData, fullAddress: e.target.value})} className="w-full px-4 py-3 h-[100px] border border-gray-300 rounded-lg outline-none focus:border-[#6D1B2D] focus:ring-1 focus:ring-[#6D1B2D] resize-none text-black bg-white" />
                </div>
                <div className="flex gap-4 pt-4">
                  {savedAddresses.length > 0 && (
                    <button onClick={() => setShowAddAddress(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg">Cancel</button>
                  )}
                  <button onClick={handleSaveAddress} disabled={isProcessing} className="flex-1 py-3 bg-[#6D1B2D] hover:bg-[#8A253D] text-white font-bold rounded-lg disabled:opacity-50">
                    {isProcessing ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAddresses.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => {
                      setSelectedAddressId(addr.id)
                      setAddressData({ name: addr.name, email: addr.email, phone: addr.phone, pincode: addr.pincode, state: addr.state, city: addr.city, fullAddress: addr.fullAddress })
                    }}
                    className={`p-5 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-[#6D1B2D] bg-[#6D1B2D]/5' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4 items-start">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAddressId === addr.id ? 'border-[#6D1B2D]' : 'border-gray-300'}`}>
                          {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 rounded-full bg-[#6D1B2D]"></div>}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{addr.name} {addr.is_default && <span className="ml-2 text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded uppercase">Default</span>}</p>
                          <p className="text-sm text-gray-600 mt-1">{addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}</p>
                          <p className="text-sm text-gray-600 mt-1">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3 Content */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 mb-8 flex flex-col items-center text-center py-12">
            {paymentSuccess ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-28 h-28 bg-gradient-to-tr from-green-400 to-green-600 text-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
                >
                  <motion.div
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <Check className="w-16 h-16" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl font-bold text-gray-900 mb-2 font-serif"
                >
                  Payment Successful!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-gray-500 font-medium text-lg"
                >
                  Your order has been placed successfully.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1 }}
                  className="mt-8 flex items-center gap-2 text-sm text-gray-400 font-medium"
                >
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-[#6D1B2D] animate-spin"></div>
                  Redirecting to your profile...
                </motion.div>
              </motion.div>
            ) : (
              <>
                <div className="w-16 h-16 bg-[#F5F2F0] text-[#6D1B2D] rounded-full flex items-center justify-center mb-4">
                  <CreditCard className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Secure Checkout</h2>
                <p className="text-gray-500 mb-8 max-w-sm">Please select your preferred payment method to complete the order of ₹{total.toLocaleString('en-IN')}.00.</p>
                
                <div className="w-full max-w-sm flex flex-col gap-4 mb-8">
                  <label className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-[#6D1B2D] bg-[#6D1B2D]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-[#6D1B2D]' : 'border-gray-300'}`}>
                        {paymentMethod === 'online' && <div className="w-2.5 h-2.5 bg-[#6D1B2D] rounded-full"></div>}
                      </div>
                      <span className="font-bold text-gray-900">Online Payment</span>
                    </div>
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <input type="radio" className="hidden" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} />
                  </label>

                  <label className={`relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#6D1B2D] bg-[#6D1B2D]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-[#6D1B2D]' : 'border-gray-300'}`}>
                        {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-[#6D1B2D] rounded-full"></div>}
                      </div>
                      <span className="font-bold text-gray-900">Cash on Delivery</span>
                    </div>
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <input type="radio" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  </label>
                </div>

                <div className="w-full border-t border-gray-100 pt-8">
                  <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
                    256-bit SSL encrypted secure transaction
                  </p>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Fixed Bottom Bar */}
      {step !== 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-3xl mx-auto flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-bold mb-0.5">Total</span>
              <span className="font-bold text-[22px] text-[#6D1B2D] leading-none mb-1">₹{total.toLocaleString('en-IN')}</span>
              <span className="text-[10px] text-[#6D1B2D] font-bold flex items-center gap-1 cursor-pointer">View price details <ChevronDown className="w-3 h-3" /></span>
            </div>
            <button 
              onClick={proceedToNextStep}
              disabled={step === 2 && showAddAddress}
              className="bg-[#6D1B2D] hover:bg-[#8A253D] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#6D1B2D]/20 transition-all disabled:opacity-50"
            >
              <Lock className="w-4 h-4" /> {step === 1 ? 'Checkout' : 'Proceed'}
            </button>
          </div>
        </div>
      )}
      
      {step === 3 && !paymentSuccess && (
         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-safe z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="max-w-3xl mx-auto flex justify-between items-center w-full">
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-bold mb-0.5">Total</span>
              <span className="font-bold text-[22px] text-[#6D1B2D] leading-none mb-1">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button 
              onClick={handleCheckout} 
              disabled={isProcessing}
              className="bg-[#6D1B2D] hover:bg-[#8A253D] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#6D1B2D]/20 transition-all disabled:opacity-50"
            >
               {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
               {isProcessing ? 'Processing...' : paymentMethod === 'online' ? 'Pay Now' : 'Place Order'}
            </button>
          </div>
        </div>
      )}


      {/* Error Modal Overlay */}
      {errorModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-500">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">Notice</h3>
            <p className="text-gray-600 mb-6 text-sm">{errorModal}</p>
            <button 
              onClick={() => setErrorModal('')}
              className="w-full bg-[#6D1B2D] hover:bg-[#8A253D] text-white py-3 rounded-xl font-bold transition-colors"
            >
              OK
            </button>
          </motion.div>
        </div>
      )}

    </div>
  )
}
