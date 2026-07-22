'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Camera, LayoutDashboard, History, Settings, MapPin, Star, LogOut, Wallet, Truck, Package, Heart, HeadphonesIcon, ChevronRight, Edit2, Loader2, CheckCircle, Ticket, UserCircle, Bell, Filter, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AddressModal } from '@/components/layout/AddressModal'

type TabType = 'dashboard' | 'history' | 'account' | 'address' | 'points' | 'review';

function getItemPrice(item: any, order?: any) {
  if (!item && !order) return 0;
  const p = item?.price_at_time || item?.price || item?.products?.price || item?.products?.actual_price;
  if (p && Number(p) > 0) return Number(p);
  if (order?.total_amount) {
    const qty = item?.quantity || 1;
    return Math.round(Number(order.total_amount) / qty);
  }
  return 0;
}

function renderItemPrice(item: any, order?: any) {
  if (!item && !order) return <span>₹0</span>;
  const origPrice = Number(item?.price_at_time || item?.price || item?.products?.price || item?.products?.actual_price || 0);
  const totalItemsQty = (order?.order_items || []).reduce((acc: number, i: any) => acc + (i.quantity || 1), 0) || 1;
  const paidPrice = order?.total_amount ? Math.round(Number(order.total_amount) / totalItemsQty) : origPrice;
  
  if (origPrice > paidPrice && paidPrice > 0) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="line-through text-gray-400 text-xs font-normal">₹{origPrice.toLocaleString('en-IN')}</span>
        <span className="font-bold text-green-600">₹{paidPrice.toLocaleString('en-IN')}</span>
      </span>
    );
  }
  const finalP = paidPrice > 0 ? paidPrice : origPrice;
  return <span className="font-bold text-gray-900">₹{finalP.toLocaleString('en-IN')}</span>;
}

function ProfileContent() {
  const { user, isAuthenticated, logout, login } = useAuthStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [addresses, setAddresses] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [reviewTab, setReviewTab] = useState<'to_review' | 'history'>('to_review')
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'dashboard' | 'account' | 'orders' | 'order_details' | 'reviews'>('dashboard')
  const [mobileActiveOrder, setMobileActiveOrder] = useState<any | null>(null)
  const [mobileOrdersFilter, setMobileOrdersFilter] = useState<'all' | 'paid' | 'shipped' | 'delivered' | 'cancelled'>('all')

  useEffect(() => {
    setMounted(true)
    if (mounted && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null
    if (tab && ['dashboard', 'history', 'review'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (user?.name) setEditName(user.name)
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
  }, [user])

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setProfilePhoto(base64)
        localStorage.setItem('profilePhoto', base64)
      }
      reader.readAsDataURL(file)
    }
  }

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  useEffect(() => {
    async function fetchOrders() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*))')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        
        if (data) setOrders(data)
      }
      setLoadingOrders(false)
    }
    
    async function fetchAddresses() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('user_addresses')
          .select('*')
          .eq('user_id', authUser.id)
          .order('is_default', { ascending: false })
        if (data) setAddresses(data)
      }
    }

    async function fetchReviews() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data } = await supabase
          .from('product_reviews')
          .select('*, products(*)')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
        if (data) setReviews(data)
      }
      setLoadingReviews(false)
    }
    
    let pollInterval: NodeJS.Timeout;
    if (isAuthenticated) {
      fetchOrders()
      fetchAddresses()
      fetchReviews()
      
      // Auto-reload polling for orders to pop up reviews immediately when delivered
      pollInterval = setInterval(() => {
        fetchOrders()
        fetchReviews()
      }, 5000)
    }
    
    const handleAddressUpdate = () => {
      fetchAddresses()
    }
    window.addEventListener('addressUpdated', handleAddressUpdate)
    return () => {
      window.removeEventListener('addressUpdated', handleAddressUpdate)
      if (pollInterval) clearInterval(pollInterval)
    }
  }, [isAuthenticated])

  if (!mounted || !isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  // Compute unreviewed items
  const unreviewedItems: any[] = [];
  if (orders && reviews) {
    const reviewSet = new Set(reviews.map(r => `${r.order_id}-${r.product_id}`));
    orders.forEach(order => {
      if (order.status === 'delivered' && order.order_items) {
        order.order_items.forEach((item: any) => {
          if (!reviewSet.has(`${item.order_id}-${item.product_id}`)) {
            unreviewedItems.push({ ...item, order_created_at: order.created_at });
          }
        });
      }
    });
  }

  const handleSaveName = () => {
    if (user && editName.trim()) {
      login({ name: editName.trim(), email: user.email })
      setIsEditing(false)
    }
  }

  const renderTabContent = (overrideTab?: string) => {
    const tabToRender = overrideTab || activeTab;
    switch (tabToRender) {
      case 'dashboard':
        return (
          <div className="space-y-12">
            {/* Account Details Section */}
            <div className="space-y-6 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 w-full border border-gray-300 rounded-md px-4 py-2 text-black focus:ring-primary focus:border-primary min-w-0"
                    />
                    <button onClick={handleSaveName} className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-light whitespace-nowrap">Save</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={user?.email || ''}
                    disabled
                    className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-500 cursor-not-allowed min-w-0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed directly.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="+91"
                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-black focus:ring-primary focus:border-primary min-w-0"
                  />
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-6 pt-8 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Saved Addresses</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.length === 0 ? (
                  <div className="text-gray-500 py-4 text-sm border border-dashed border-gray-200 rounded-xl p-6 text-center">
                    No addresses saved. Add one from the Delivery location menu at the top.
                  </div>
                ) : (
                  addresses.map((address) => (
                    <div key={address.id} className={`border ${address.is_default ? 'border-[#cce8b5] bg-[#f4f9f1]/30' : 'border-gray-200 bg-white'} rounded-xl p-6 relative`}>
                      {address.is_default && (
                        <span className="absolute top-4 right-4 bg-blue-100 text-primary text-xs font-bold px-2 py-1 rounded">DEFAULT</span>
                      )}
                      <h3 className="font-bold text-gray-900 mb-2">{address.name || user?.name}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {address.fullAddress || `${address.city}, ${address.state} ${address.pincode}`}
                        <br/>
                        <span className="text-gray-400 mt-1 inline-block">{address.phone}</span>
                      </p>
                      <div className="flex gap-4 mt-6">
                        <button 
                          onClick={() => setIsAddressModalOpen(true)} 
                          className="text-sm text-[#689f38] font-medium hover:underline flex items-center gap-1"
                        >
                          <Edit2 className="w-4 h-4"/> Edit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
          </div>
        );
      case 'history':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4">
              <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">{orders.length} Orders</span>
            </div>
            
            {loadingOrders ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#689f38]" />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-500 max-w-sm mb-6">Looks like you haven't placed any orders. Start exploring our premium collection.</p>
                <button onClick={() => router.push('/shop')} className="bg-[#689f38] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#5b8a30] transition-colors">Start Shopping</button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => {
                  const itemCount = order.order_items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
                  const isDelivered = order.status === 'delivered';
                  
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 group">
                      
                      {/* Order Header */}
                      <div className="bg-gray-50/80 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex gap-8">
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order Placed</p>
                            <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Amount</p>
                            <p className="text-sm font-bold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="hidden sm:block">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Order ID</p>
                            <p className="text-sm font-mono font-medium text-gray-700">#{order.id.split('-')[0].toUpperCase()}</p>
                          </div>
                        </div>
                        
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          isDelivered ? 'bg-green-50 text-green-700 border-green-200' : 
                          order.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          order.status === 'shipped' ? 'bg-[#f4f9f1] text-primary border-[#cce8b5]' :
                          order.status === 'packed' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          order.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                          {order.status ? order.status.replace(/_/g, ' ') : 'Processing'}
                        </div>
                      </div>

                      {/* Order Body */}
                      <div className="p-6 flex flex-col md:flex-row gap-8">
                        
                        {/* Products List */}
                        <div className="flex-1 space-y-4">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex gap-4 items-center">
                              <div className="w-20 h-20 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center p-2 shrink-0 relative overflow-hidden group-hover:border-gray-300 transition-colors">
                                {item.products?.image_url ? (
                                  <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-contain mix-blend-multiply" />
                                ) : (
                                  <Package className="w-8 h-8 text-gray-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-base">{item.products?.title || 'Premium Plant'}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="text-sm font-medium">{renderItemPrice(item, order)}</div>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <p className="text-sm text-gray-500">Qty: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                                </div>
                              </div>
                              <div className="hidden sm:block text-right shrink-0">
                                <button className="text-[#689f38] text-sm font-semibold hover:underline">Buy again</button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Info & Price Details Sidebars */}
                        <div className="md:w-72 shrink-0 space-y-4 self-start">
                          {order.shipping_address && (
                            <div className="bg-[#f4f9f1]/30 border border-blue-100/50 rounded-xl p-4">
                              <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-[#689f38]" /> Delivery Info
                              </h5>
                              <p className="font-semibold text-gray-900 text-sm mb-1">{order.shipping_address.name}</p>
                              <p className="text-xs text-gray-600 leading-relaxed mb-2">
                                {order.shipping_address.fullAddress}<br/>
                                {order.shipping_address.city}, {order.shipping_address.state}<br/>
                                {order.shipping_address.pincode}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                Phone: {order.shipping_address.phone}
                              </p>
                            </div>
                          )}

                          <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4">
                            <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Price Details</h5>
                            {(() => {
                              const rawSubtotal = (order.order_items || []).reduce((sum: number, i: any) => {
                                const p = Number(i?.price_at_time || i?.price || i?.products?.price || i?.products?.actual_price || 0);
                                return sum + (p * (i.quantity || 1));
                              }, 0);
                              const subtotal = rawSubtotal > (order.total_amount || 0) ? rawSubtotal : (order.total_amount || 0);
                              const discount = subtotal > (order.total_amount || 0) ? subtotal - (order.total_amount || 0) : Number(order.discount_amount || 0);
                              return (
                                <div className="space-y-2 text-xs font-medium text-gray-600">
                                  <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                                  </div>
                                  {discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-bold">
                                      <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</span>
                                      <span>-₹{discount.toLocaleString('en-IN')}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span>Shipping Fee</span>
                                    <span className="text-green-600 font-bold">FREE</span>
                                  </div>
                                  <div className="border-t border-gray-200 pt-2.5 flex justify-between text-sm font-black text-gray-900">
                                    <span>Total Amount</span>
                                    <span className="text-[#689f38]">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        
                      </div>

                      {/* Shipping Status Timeline */}
                      <div className="px-6 py-5 border-t border-gray-100 bg-white">
                        <h5 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-6">Tracking Status</h5>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative gap-6 sm:gap-0">
                          <div className="hidden sm:block absolute left-0 top-3 right-0 h-0.5 bg-gray-100 z-0"></div>
                          <div className="sm:hidden absolute left-3 top-0 bottom-0 w-0.5 bg-gray-100 z-0"></div>
                          
                          {[
                            { id: 'pending', label: 'Ordered', icon: <Package className="w-3.5 h-3.5" /> },
                            { id: 'packed', label: 'Packed', icon: <Package className="w-3.5 h-3.5" /> },
                            { id: 'shipped', label: 'Shipped', icon: <Truck className="w-3.5 h-3.5" /> },
                            { id: 'out_for_delivery', label: 'Out for Delivery', icon: <Truck className="w-3.5 h-3.5" /> },
                            { id: 'delivered', label: 'Delivered', icon: <CheckCircle className="w-3.5 h-3.5" /> }
                          ].map((status, index) => {
                            const statuses = ['pending', 'packed', 'shipped', 'out_for_delivery', 'delivered']
                            let currentStatus = order.status;
                            if (currentStatus === 'paid') currentStatus = 'pending'; // Treat paid as pending for timeline
                            const currentIndex = statuses.indexOf(currentStatus)
                            const isCompleted = index <= currentIndex

                            return (
                              <div key={status.id} className="relative z-10 flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-auto">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white transition-colors duration-500 ${isCompleted ? 'border-[#689f38] text-[#689f38]' : 'border-gray-200 text-gray-300'}`}>
                                  {isCompleted ? status.icon : <div className="w-2 h-2 bg-gray-200 rounded-full"></div>}
                                </div>
                                <div className="sm:text-center">
                                  <p className={`text-xs sm:text-sm font-bold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{status.label}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Order Footer */}
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                        <button className="text-sm font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1 transition-colors">
                          View Invoice <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="text-sm font-bold text-[#689f38] hover:text-[#4d7528] transition-colors">
                          Track Package
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            )}
          </div>
        );


      case 'review':
        return (
          <>
            <div className="flex gap-4 mb-8">
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium ${reviewTab === 'to_review' ? 'bg-[#689f38] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`} 
                onClick={() => setReviewTab('to_review')}
              >
                To Review
              </button>
              <button 
                className={`px-6 py-2 rounded-full text-sm font-medium ${reviewTab === 'history' ? 'bg-[#689f38] text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'} transition-colors`} 
                onClick={() => setReviewTab('history')}
              >
                Review History
              </button>
            </div>

            <div className="space-y-8">
              {reviewTab === 'to_review' ? (
                unreviewedItems.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">You have no pending reviews.</p>
                  </div>
                ) : (
                  unreviewedItems.map((item, idx) => (
                    <div key={`${item.order_id}-${item.product_id}-${idx}`} className="border-b border-gray-100 pb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                            {item.products?.image_url ? (
                              <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover mix-blend-multiply" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 leading-tight">{item.products?.title || 'Product'}</h4>
                            <p className="text-sm text-gray-500 mt-1">{item.products?.category || 'Category'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-2">Purchased on<br/>{new Date(item.order_created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <button onClick={() => router.push(`/shop/${item.product_id}`)} className="px-4 py-2 bg-[#689f38] text-white text-sm rounded-md hover:bg-[#5b8a30] transition-colors shadow-sm">Write Review</button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : (
                loadingReviews ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-[#689f38]" /></div>
                ) : reviews.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">You haven't submitted any reviews yet.</p>
                  </div>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-8">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-gray-200">
                            {review.products?.image_url ? (
                              <img src={review.products.image_url} alt={review.products.title} className="w-full h-full object-cover mix-blend-multiply" />
                            ) : (
                              <Package className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 leading-tight">{review.products?.title || 'Product'}</h4>
                            <p className="text-sm text-gray-500 mt-1">{review.products?.category || 'Category'}</p>
                            <div className="flex gap-0.5 mt-2 text-sm">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-[#FFB800] text-[#FFB800]' : 'text-gray-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-2">Reviewed on<br/>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          <button onClick={() => router.push(`/shop/${review.product_id}`)} className="text-sm text-[#689f38] hover:underline font-medium">View Product</button>
                        </div>
                      </div>
                      {review.review_text && (
                        <p className="text-sm text-gray-600 italic">"{review.review_text}"</p>
                      )}
                    </div>
                  ))
                )
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F8F9FA] md:bg-[#EAF3FA]">
      {/* 
        -------------------------------------------
        MOBILE VIEW
        -------------------------------------------
      */}
      <div className="block md:hidden bg-[#F9F9FB] min-h-screen pb-20 font-sans">
        
        {mobileView === 'dashboard' && (
          <>
            {/* Dashboard Blue Header Card */}
            <div className="bg-[#689f38] text-white rounded-b-[2rem] pt-12 pb-8 px-6 shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="relative group w-16 h-16 shrink-0">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-16 h-16 rounded-full border-2 border-white/20 object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-3xl font-medium">
                      {initials}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-white text-[#689f38] p-1 rounded-full shadow-sm cursor-pointer border border-gray-100 flex items-center justify-center w-5 h-5">
                    <Edit2 className="w-3 h-3" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif leading-tight">{user?.name || 'User'}</h2>
                  <p className="text-sm text-blue-100 mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className={`grid ${(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor') ? 'grid-cols-4' : 'grid-cols-3'} gap-2 text-center relative z-10 border-t border-white/10 pt-6`}>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setMobileView('orders')}>
                  <span className="font-bold text-lg mb-1 border-b-2 border-white/30 pb-0.5 min-w-[12px]">{orders.length}</span>
                  <span className="text-[10px] font-bold tracking-wide">Orders</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setMobileView('reviews')}>
                  <span className="font-bold text-lg mb-1 border-b-2 border-white/30 pb-0.5 min-w-[12px]">{reviews.length}</span>
                  <span className="text-[10px] font-bold tracking-wide">Reviews</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer" onClick={() => setMobileView('account')}>
                  <span className="font-bold text-lg mb-1 border-b-2 border-white/30 pb-0.5 min-w-[12px]">{addresses.length}</span>
                  <span className="text-[10px] font-bold tracking-wide">Addresses</span>
                </div>
                {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor') && (
                  <div className="flex flex-col items-center cursor-pointer" onClick={() => router.push('/admin')}>
                    <LayoutDashboard className="w-5 h-5 mb-1 opacity-90" />
                    <span className="text-[10px] font-bold tracking-wide">Admin</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 mt-6 space-y-6">
              {/* My Orders Section */}
              <div>
                <div className="flex justify-between items-center mb-3 px-1">
                  <h3 className="font-bold text-gray-900 text-sm">My Orders</h3>
                  <button onClick={() => setMobileView('orders')} className="text-[#689f38] text-xs font-bold flex items-center gap-1">View All <ChevronRight className="w-3 h-3" /></button>
                </div>
                <div 
                  onClick={() => setMobileView('orders')}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-gray-100/50 cursor-pointer active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F5F8FF] text-[#689f38] flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Orders</h4>
                      <p className="text-xs text-gray-500">Track and manage your orders</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Account Section */}
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-1">Account</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                  
                  <div onClick={() => setMobileView('account')} className="flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <UserCircle className="w-5 h-5 text-gray-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Profile Details</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Manage your profile</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  <div onClick={() => setMobileView('account')} className="flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">Addresses</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Manage your saved addresses</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  <div onClick={() => setMobileView('reviews')} className="flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-[#FFB800] shrink-0" />
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">My Reviews</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">View and write reviews</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                  {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor') && (
                    <div onClick={() => router.push('/admin')} className="flex items-center justify-between p-4 border-b border-gray-50 cursor-pointer active:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-5 h-5 text-[#689f38] shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Admin Panel</h4>
                          <p className="text-[11px] text-gray-500 mt-0.5">Manage store data</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  <div onClick={handleLogout} className="flex items-center justify-between p-4 cursor-pointer active:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <LogOut className="w-5 h-5 text-[#689f38] shrink-0" />
                      <div>
                        <h4 className="font-bold text-[#689f38] text-sm">Logout</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">Sign out from your account</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>

                </div>
              </div>
            </div>
          </>
        )}

        {mobileView === 'account' && (
          <div className="bg-[#F9F9FB] min-h-screen">
            <div className="bg-white flex items-center justify-between px-4 py-4 sticky top-0 z-10 shadow-sm">
              <button onClick={() => setMobileView('dashboard')} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
              <h1 className="font-serif text-lg font-bold text-gray-900">My Account</h1>
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#689f38] rounded-full border border-white"></span>
              </div>
            </div>

            <div className="px-5 py-6 space-y-8">
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-sm px-1">Account Details</h3>
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Full Name</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#689f38]">
                      <UserCircle className="w-4 h-4 text-gray-400 mr-3 shrink-0" />
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full text-sm outline-none font-medium text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50">
                      <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      <input type="email" value={user?.email || ''} disabled className="w-full text-sm outline-none font-medium text-gray-900 bg-transparent" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Email address cannot be changed directly.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5 focus-within:border-[#689f38]">
                      <svg className="w-4 h-4 text-gray-400 mr-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      <input type="tel" placeholder="+91" className="w-full text-sm outline-none font-medium text-gray-900" />
                    </div>
                  </div>
                  <button onClick={handleSaveName} className="w-full bg-[#689f38] hover:bg-[#5b8a30] text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-green-700/20 active:scale-[0.98] transition-transform mt-2">Save Changes</button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-bold text-gray-900 text-sm">Saved Addresses</h3>
                  <button onClick={() => setIsAddressModalOpen(true)} className="text-[#689f38] font-bold text-xs">+ Add New</button>
                </div>
                {addresses.length === 0 ? (
                   <p className="text-sm text-gray-500 text-center py-4 bg-white rounded-2xl border border-gray-100/50">No addresses found.</p>
                ) : (
                  addresses.map(addr => (
                    <div key={addr.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100/50 relative">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#F5F8FF] text-[#689f38] flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="flex-1 pr-16">
                          <h4 className="font-bold text-gray-900 text-sm mb-1">{addr.name || user?.name || 'Home'}</h4>
                          <p className="text-[12px] text-gray-600 leading-relaxed mb-1">{addr.fullAddress || `${addr.city}, ${addr.state} ${addr.pincode}`}</p>
                          <p className="text-[12px] text-gray-600 font-medium">{addr.phone}</p>
                        </div>
                        {addr.is_default && (
                          <span className="absolute top-5 right-5 bg-[#F5F8FF] text-[#689f38] text-[10px] font-bold px-2 py-1 rounded">DEFAULT</span>
                        )}
                      </div>
                      <div className="flex items-center pt-3 border-t border-gray-50">
                        <button onClick={() => setIsAddressModalOpen(true)} className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-[#689f38]"><Edit2 className="w-3.5 h-3.5" /> Edit</button>
                        <button className="flex-1 flex justify-center items-center gap-1.5 text-xs font-bold text-[#689f38] border-l border-gray-50"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button onClick={handleLogout} className="w-full flex justify-center items-center gap-2 border-2 border-gray-100 text-[#689f38] bg-white font-bold py-3.5 rounded-xl text-sm shadow-sm active:bg-gray-50 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}

        {mobileView === 'reviews' && (
          <div className="bg-[#F9F9FB] min-h-screen">
            <div className="bg-white flex items-center justify-between px-4 py-4 sticky top-0 z-10 shadow-sm mb-6">
              <button onClick={() => setMobileView('dashboard')} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
              <h1 className="font-serif text-lg font-bold text-gray-900">My Reviews</h1>
              <div className="w-9"></div>
            </div>
            <div className="px-4 pb-12">
              {renderTabContent('review')}
            </div>
          </div>
        )}

        {mobileView === 'orders' && (
          <div className="bg-[#F9F9FB] min-h-screen">
            <div className="bg-white flex items-center justify-between px-4 py-4 sticky top-0 z-10 shadow-sm">
              <button onClick={() => setMobileView('dashboard')} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
              <h1 className="font-serif text-lg font-bold text-gray-900">Order History</h1>
              <button className="p-2 -mr-2"><Filter className="w-5 h-5 text-gray-700" /></button>
            </div>
            
            <div className="bg-white px-2 border-b border-gray-100 flex overflow-x-auto scrollbar-hide">
              {['all', 'paid', 'shipped', 'delivered', 'cancelled'].map(filter => (
                <button 
                  key={filter}
                  onClick={() => setMobileOrdersFilter(filter as any)}
                  className={`px-4 py-3 text-xs font-bold whitespace-nowrap capitalize border-b-2 transition-colors ${mobileOrdersFilter === filter ? 'text-[#689f38] border-[#689f38]' : 'text-gray-500 border-transparent'}`}
                >
                  {filter === 'all' ? 'All Orders' : filter}
                </button>
              ))}
            </div>

            <div className="px-4 py-6 space-y-4">
              {orders.filter(o => mobileOrdersFilter === 'all' || o.status === mobileOrdersFilter).length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium text-sm">No orders found.</p>
                </div>
              ) : (
                orders.filter(o => mobileOrdersFilter === 'all' || o.status === mobileOrdersFilter).map(order => (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Order Placed</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div className="text-center hidden sm:block">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Order ID</p>
                        <p className="text-sm font-bold text-gray-900">#{order.id.split('-')[0].toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-0.5">Total Amount</p>
                        <p className="text-sm font-bold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-center relative mb-4">
                      <div className="w-20 h-24 rounded-lg bg-[#F5F5F5] overflow-hidden shrink-0 border border-gray-100">
                        {order.order_items?.[0]?.products?.image_url && (
                          <img src={order.order_items[0].products.image_url} alt="Product" className="w-full h-full object-cover mix-blend-multiply" />
                        )}
                      </div>
                      <div className="flex-1 pr-16">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{order.order_items?.[0]?.products?.title || 'Product Item'}</h4>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">{renderItemPrice(order.order_items?.[0], order)}</div>
                          <p className="text-xs text-gray-500 font-medium">Qty: {order.order_items?.[0]?.quantity || 1}</p>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'shipped' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-primary'
                        }`}>
                          {order.status ? order.status.replace(/_/g, ' ') : 'Processing'}
                        </span>
                      </div>
                    </div>
                    
                    {order.shipping_address && (
                      <div className="flex items-start gap-2.5 mt-2 pt-3 border-t border-gray-50 pb-1">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-gray-900 mb-0.5 uppercase tracking-wide">Shipping To</p>
                          <p className="text-xs text-gray-600 leading-tight line-clamp-2">
                            {typeof order.shipping_address === 'string' ? order.shipping_address : 
                              `${order.shipping_address.name || user?.name || 'Home'}, ${order.shipping_address.fullAddress || order.shipping_address.city + ' ' + order.shipping_address.pincode}`}
                          </p>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={() => { setMobileActiveOrder(order); setMobileView('order_details'); }}
                      className="w-full flex items-center justify-between pt-3 border-t border-gray-50 text-[#689f38] font-bold text-xs active:bg-gray-50 transition-colors rounded-b-xl"
                    >
                      <span className="flex items-center gap-2"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> View Order Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {mobileView === 'order_details' && mobileActiveOrder && (
          <div className="bg-[#F9F9FB] min-h-screen">
            <div className="bg-white flex items-center justify-between px-4 py-4 sticky top-0 z-10 shadow-sm border-b border-gray-100">
              <button onClick={() => setMobileView('orders')} className="p-2 -ml-2"><ArrowLeft className="w-5 h-5 text-gray-700" /></button>
              <h1 className="font-serif text-lg font-bold text-gray-900">Order Details</h1>
              <div className="w-9"></div>
            </div>

            <div className="p-4 space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-5 relative">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                <p className="text-lg font-bold text-gray-900 mb-2">#{mobileActiveOrder.id.split('-')[0].toUpperCase()}</p>
                <p className="text-xs text-gray-500 font-medium">Placed on {new Date(mobileActiveOrder.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(mobileActiveOrder.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                <span className={`absolute top-5 right-5 px-3 py-1 text-[11px] font-bold rounded-md ${
                  mobileActiveOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  mobileActiveOrder.status === 'shipped' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-primary'
                }`}>
                  {mobileActiveOrder.status ? mobileActiveOrder.status.replace(/_/g, ' ') : 'Processing'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-1">Order Summary</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
                  {mobileActiveOrder.order_items?.map((item: any) => (
                    <div key={item.id} className="p-4 flex gap-4 border-b border-gray-50 last:border-0">
                      <div className="w-20 h-24 rounded-lg bg-[#F5F5F5] overflow-hidden shrink-0 border border-gray-100">
                        {item.products?.image_url && (
                          <img src={item.products.image_url} alt={item.products.title} className="w-full h-full object-cover mix-blend-multiply" />
                        )}
                      </div>
                      <div className="flex-1 py-1">
                        <h4 className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{item.products?.title}</h4>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="text-sm">{renderItemPrice(item, mobileActiveOrder)}</div>
                          <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg> Size: Free Size</span>
                          <span className="flex items-center gap-1.5"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg> Color: Default</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-1 mt-6">Price Details</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-5">
                  {(() => {
                    const rawSubtotal = (mobileActiveOrder.order_items || []).reduce((sum: number, i: any) => {
                      const p = Number(i?.price_at_time || i?.price || i?.products?.price || i?.products?.actual_price || 0);
                      return sum + (p * (i.quantity || 1));
                    }, 0);
                    const subtotal = rawSubtotal > (mobileActiveOrder.total_amount || 0) ? rawSubtotal : (mobileActiveOrder.total_amount || 0);
                    const discount = subtotal > (mobileActiveOrder.total_amount || 0) ? subtotal - (mobileActiveOrder.total_amount || 0) : Number(mobileActiveOrder.discount_amount || 0);
                    return (
                      <div className="space-y-3 text-xs font-medium text-gray-500 mb-4">
                        <div className="flex justify-between">
                          <span>Subtotal (Item Price)</span>
                          <span className="text-gray-900">₹{subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between text-green-600 font-bold">
                            <span>Discount Applied {mobileActiveOrder.coupon_code ? `(${mobileActiveOrder.coupon_code})` : ''}</span>
                            <span>-₹{discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Shipping Fee</span>
                          <span className="text-gray-900">₹0 <span className="text-green-600 font-bold ml-1">(FREE)</span></span>
                        </div>
                      </div>
                    );
                  })()}
                  <div className="border-t border-gray-50 pt-4 flex justify-between items-center bg-[#F9F9FB] -mx-5 -mb-5 p-5 rounded-b-2xl">
                    <span className="font-bold text-[#689f38] text-sm">Total Amount</span>
                    <span className="font-bold text-[#689f38] text-lg">₹{mobileActiveOrder.total_amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-sm mb-3 px-1 mt-6">Delivery Address</h3>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 p-5">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{mobileActiveOrder.shipping_address?.name || user?.name || 'Home'}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed mb-1">{mobileActiveOrder.shipping_address?.fullAddress || mobileActiveOrder.shipping_address || 'Address details unavailable.'}</p>
                      {mobileActiveOrder.shipping_address?.phone && <p className="text-xs text-gray-600 font-medium">{mobileActiveOrder.shipping_address.phone}</p>}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>


      {/* 
        -------------------------------------------
        DESKTOP VIEW
        -------------------------------------------
      */}
      <div className="hidden md:block">
        {/* Premium Green Header Banner */}
        <div className="bg-gradient-to-r from-[#5b8a30] to-[#689f38] text-white pt-16 pb-28 px-8 relative overflow-hidden shadow-inner">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border-[40px] border-white/20"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full border-[30px] border-white/20"></div>
          </div>
          <div className="container mx-auto max-w-6xl relative z-10 text-left">
            <h1 className="text-4xl font-serif font-bold mb-3 tracking-wide">My Account</h1>
            <p className="text-sm opacity-90 flex items-center gap-2 font-medium">
              <LayoutDashboard className="w-4 h-4" /> Dashboard Overview
            </p>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-4 -mt-12 pb-20">
          <div className="flex gap-8 relative z-20">
            {/* Sidebar */}
            <div className="w-72 bg-[#F8FAFC] rounded-2xl shadow-sm p-6 flex flex-col h-fit shrink-0 border border-gray-100">
              <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                <div className="relative group w-20 h-20 mb-3 mx-auto">
                  {profilePhoto ? (
                    <img src={profilePhoto} alt="Profile" className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-[#689f38] text-white flex items-center justify-center text-3xl font-bold shadow-md">
                      {initials}
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-6 h-6 drop-shadow-md" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                
                <span className="text-xs text-gray-500 mb-1">Hello</span>
                <h2 className="font-bold text-lg text-gray-900 break-all text-center px-2">{user?.name}</h2>
                <button onClick={() => setActiveTab('account')} className="text-xs text-[#689f38] mt-1 hover:underline">Edit Profile</button>
              </div>
              
              <nav className="mt-6 flex flex-col space-y-2">
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'dashboard' ? 'bg-[#689f38] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-[#689f38]'}`}
                >
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'history' ? 'bg-[#689f38] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-[#689f38]'}`}
                >
                  <History className="w-5 h-5" /> Order History
                </button>

                <button 
                  onClick={() => setActiveTab('review')} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${activeTab === 'review' ? 'bg-[#689f38] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 hover:text-[#689f38]'}`}
                >
                  <Star className="w-5 h-5" /> To Review
                </button>
              </nav>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                {(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor') && (
                  <button onClick={() => router.push('/admin')} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white bg-[#689f38] hover:bg-[#5b8a30] transition-colors font-medium mb-2 shadow-md">
                    <LayoutDashboard className="w-5 h-5" /> Admin Panel
                  </button>
                )}
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-8 min-h-[500px] border border-gray-100">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <ProfileContent />
    </Suspense>
  )
}

function UserIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
