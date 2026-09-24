'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { 
  Home, 
  Search, 
  Clock, 
  User, 
  Heart, 
  Settings, 
  Bell, 
  Package, 
  CheckCircle, 
  Truck, 
  Info, 
  LogOut, 
  Loader2, 
  ArrowLeft, 
  Star, 
  Edit2, 
  ChevronRight, 
  Droplet, 
  LayoutDashboard, 
  ShoppingBag, 
  X, 
  MapPin, 
  RotateCcw, 
  Eye, 
  Ban,
  Sparkles,
  Leaf,
  ShieldCheck,
  Compass,
  ArrowUpRight,
  MessageCircle,
  Award
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

type TabType = 'dashboard' | 'orders' | 'settings'

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const { addItem } = useCartStore()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [orderFilter, setOrderFilter] = useState<'all' | 'transit' | 'delivered'>('all')
  const [cancelModal, setCancelModal] = useState<{ open: boolean; orderId: string; loading: boolean }>({ open: false, orderId: '', loading: false })
  const [trackModal, setTrackModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null })
  const [viewModal, setViewModal] = useState<{ open: boolean; order: any | null }>({ open: false, order: null })
  const [successToast, setSuccessToast] = useState('')

  useEffect(() => {
    setMounted(true)
    if (mounted && !isAuthenticated) {
      router.push('/')
    }
  }, [mounted, isAuthenticated, router])

  useEffect(() => {
    const tab = searchParams.get('tab') as TabType | null
    if (tab && ['dashboard', 'orders', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    const savedPhoto = localStorage.getItem('profilePhoto')
    if (savedPhoto) setProfilePhoto(savedPhoto)
  }, [user])

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
    
    if (isAuthenticated) {
      fetchOrders()
    }
  }, [isAuthenticated])

  if (!mounted || !isAuthenticated) return null

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) 
    : 'AV'

  const completedOrders = orders.filter(o => o.status === 'delivered').length
  const transitOrders = orders.filter(o => ['pending', 'packed', 'shipped', 'out_for_delivery'].includes(o.status)).length
  
  // Calculate dynamic vitality index (minimum 70% base for members, scaled by activity)
  const vitalityPercent = orders.length === 0 ? 85 : Math.min(100, 75 + completedOrders * 5 + transitOrders * 3)

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'transit') return ['pending', 'packed', 'shipped', 'out_for_delivery'].includes(o.status)
    if (orderFilter === 'delivered') return o.status === 'delivered'
    return true
  })

  const latestTransitOrder = orders.find(o => ['pending', 'packed', 'shipped', 'out_for_delivery'].includes(o.status))

  const handleCancelOrder = async () => {
    setCancelModal(m => ({ ...m, loading: true }))
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', cancelModal.orderId)
    if (!error) {
      setOrders(orders.map(o => o.id === cancelModal.orderId ? { ...o, status: 'cancelled' } : o))
      setCancelModal({ open: false, orderId: '', loading: false })
      setSuccessToast('Order cancelled successfully')
      setTimeout(() => setSuccessToast(''), 3000)
    } else {
      setCancelModal(m => ({ ...m, loading: false }))
    }
  }

  const handleReorder = (order: any) => {
    if (order.order_items) {
      order.order_items.forEach((item: any) => {
        if (item.products) {
          addItem({
            id: item.products.id,
            title: item.products.title,
            price: item.products.price || item.price,
            imageUrl: item.products.image_url,
            quantity: item.quantity || 1,
          })
        }
      })
      router.push('/checkout')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        setProfilePhoto(base64)
        localStorage.setItem('profilePhoto', base64)
        setSuccessToast('Profile avatar updated!')
        setTimeout(() => setSuccessToast(''), 3000)
      }
      reader.readAsDataURL(file)
    }
  }

  /* ═══════════════════════════════════════════════════════════════
     DESKTOP + MOBILE DASHBOARD (FIGMA BENTO GRID & ANIMATIONS)
  ═══════════════════════════════════════════════════════════════ */
  const renderDashboard = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-8"
    >
      {/* ── TOP WELCOME HEADER (PC VIEW) ── */}
      <div className="hidden md:flex justify-between items-end pb-6 border-b border-emerald-950/5 relative">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/60 text-emerald-800 text-xs font-bold uppercase tracking-widest border border-emerald-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Botanical Sanctuary Patron
            </span>
            <span className="text-xs text-gray-400 font-medium">| Member ID #{user?.name ? user.name.slice(0, 3).toUpperCase() : 'AV'}-2024</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif font-black text-[#11311F] tracking-tight">
            Welcome back, <span className="text-emerald-700">{user?.name || 'Plant Lover'}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-lg font-medium">
            Your personal garden sanctuary is flourishing. Here is your real-time botanical overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="group px-5 py-3 rounded-2xl bg-gradient-to-r from-[#11311F] to-[#235839] text-white text-sm font-bold shadow-lg shadow-emerald-950/15 hover:shadow-xl hover:shadow-emerald-950/25 transition-all duration-300 flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Plants</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* ── FIGMA BENTO GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
        
        {/* BENTO CARD 1: MEMBER PASSPORT / PROFILE SHOWCASE (7 COLS) */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="md:col-span-7 bg-white/90 backdrop-blur-md rounded-3xl p-6 lg:p-8 border border-emerald-950/5 shadow-[0_4px_24px_-4px_rgba(20,50,30,0.05)] relative overflow-hidden flex flex-col justify-between group"
        >
          {/* Ambient Botanical Gradient Glow */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-50 rounded-full blur-3xl pointer-events-none" />

          {/* Top Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
            {/* Avatar with Glow Ring & Photo Upload */}
            <div className="relative group/avatar">
              <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xl shadow-emerald-950/10 shrink-0 relative bg-gradient-to-br from-emerald-800 to-[#11311F] text-white flex items-center justify-center">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-serif font-black text-3xl lg:text-4xl tracking-tighter text-emerald-100">
                    {initials}
                  </span>
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-md flex items-center justify-center cursor-pointer hover:bg-emerald-50 transition-colors"
                title="Change Avatar"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-[11px] font-bold text-amber-800">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" /> Gold Sanctuary Tier
                </span>
                <span className="hidden sm:inline-block text-xs text-gray-400">• Active Patron</span>
              </div>
              
              <h3 className="text-2xl lg:text-3xl font-serif font-black text-[#11311F] truncate tracking-tight">
                {user?.name || 'Arogyavruksham Member'}
              </h3>
              
              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                {user?.email || 'Valued Botanical Collector'}
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-100/80 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Plant Parent
                </span>
                <span className="px-3 py-1 rounded-xl bg-[#F4F8F5] text-gray-600 text-[11px] font-semibold border border-gray-100 flex items-center gap-1.5">
                  <Leaf className="w-3.5 h-3.5 text-[#2D6A4F]" /> 100% Organic Care
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6 pt-6 border-t border-emerald-950/5 relative z-10">
            <div className="bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 transition-colors border border-emerald-100/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Orders</span>
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif font-black text-2xl lg:text-3xl text-[#11311F]">{orders.length}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Botanical parcels placed</p>
            </div>

            <div className="bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl p-4 transition-colors border border-emerald-100/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">In Transit</span>
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="font-serif font-black text-2xl lg:text-3xl text-[#11311F]">{transitOrders}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Active nursery shipments</p>
            </div>
          </div>
        </motion.div>

        {/* BENTO CARD 2: SANCTUARY VITALITY METER (5 COLS) */}
        <motion.div 
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="md:col-span-5 bg-gradient-to-br from-[#11311F] via-[#16432B] to-[#0A1F13] rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-emerald-950/20 flex flex-col justify-between group"
        >
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400 block mb-0.5">
                Sanctuary Health Index
              </span>
              <h4 className="font-serif font-black text-xl text-white">Flourishing Garden</h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          {/* Animated Circular Gauge Meter */}
          <div className="my-6 flex items-center justify-center relative z-10">
            <div className="relative w-36 h-36 lg:w-40 lg:h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="42" 
                  fill="none" 
                  stroke="url(#botanicalGaugeGrad)" 
                  strokeWidth="7" 
                  strokeDasharray="264" 
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 264 - (264 * vitalityPercent) / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  strokeLinecap="round" 
                />
                <defs>
                  <linearGradient id="botanicalGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="60%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#A7F3D0" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif font-black text-3xl lg:text-4xl text-white tracking-tight">
                  {vitalityPercent}%
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300/90 mt-0.5">
                  Optimal Vitality
                </span>
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-100/80">
            <div className="flex items-center gap-2">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>{completedOrders > 0 ? `${completedOrders} Plants Nurtured` : 'Sanctuary Ready to Grow'}</span>
            </div>
            <span className="font-bold text-white">Tier: Master</span>
          </div>
        </motion.div>

        {/* BENTO CARD 3: LIVE SHIPMENT TRACKER / HIGHLIGHT (12 COLS) */}
        {latestTransitOrder ? (
          <motion.div 
            whileHover={{ y: -3 }}
            className="md:col-span-12 bg-white/95 rounded-3xl p-6 lg:p-7 border border-emerald-500/20 shadow-md relative overflow-hidden"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 overflow-hidden flex items-center justify-center p-2 shrink-0">
                  {latestTransitOrder.order_items?.[0]?.products?.image_url ? (
                    <img src={latestTransitOrder.order_items[0].products.image_url} alt="Plant" className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-6 h-6 text-emerald-700" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Arriving Soon
                    </span>
                    <span className="text-xs text-gray-400 font-semibold">
                      Order #{latestTransitOrder.id.split('-')[0].toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-serif font-black text-lg text-[#11311F] mt-1">
                    {latestTransitOrder.order_items?.[0]?.products?.title || 'Botanical Selection'}
                  </h4>
                  <p className="text-xs text-gray-500">Carefully packaged with nutrient soil & hydration wrap</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTrackModal({ open: true, order: latestTransitOrder })}
                  className="px-5 py-2.5 bg-[#11311F] text-white rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all flex items-center gap-1.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Track Live Package</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            whileHover={{ y: -3 }}
            className="md:col-span-12 bg-gradient-to-r from-emerald-50/70 via-white to-emerald-50/40 rounded-3xl p-6 lg:p-7 border border-emerald-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200/80 shadow-sm flex items-center justify-center shrink-0 text-emerald-700">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-black text-lg text-[#11311F]">
                  Botanical Care Tip of the Day
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  Keep indoor tropicals near indirect sunlight and mist foliage twice a week for vibrant emerald leaves.
                </p>
              </div>
            </div>

            <Link
              href="/shop"
              className="px-5 py-2.5 bg-white border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-50 shadow-sm transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Explore New Additions</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

      </div>

      {/* ── QUICK ACTIONS (FIGMA CARDS WITH SPRING HOVER) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">
            Sanctuary Hub
          </h3>
          <span className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('orders')}>
            View All History →
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
          {/* Card A: My Orders */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => setActiveTab('orders')}
            className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-[#11311F] group-hover:text-white transition-colors duration-300">
                <Package className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-[#11311F] group-hover:text-emerald-800 transition-colors">
                  My Orders
                </h4>
                <p className="text-xs text-gray-500 font-medium">Track delivery & invoices</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.div>

          {/* Card B: Shop Plants */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => router.push('/shop')}
            className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-[#11311F] group-hover:text-white transition-colors duration-300">
                <Leaf className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-[#11311F] group-hover:text-emerald-800 transition-colors">
                  Discover Flora
                </h4>
                <p className="text-xs text-gray-500 font-medium">Browse rare species</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.div>

          {/* Card C: Settings */}
          <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => setActiveTab('settings')}
            className="bg-white rounded-3xl p-6 border border-emerald-950/5 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-center text-emerald-800 group-hover:bg-[#11311F] group-hover:text-white transition-colors duration-300">
                <Settings className="w-6 h-6 transition-transform group-hover:scale-110" />
              </div>
              <div>
                <h4 className="font-serif font-black text-base text-[#11311F] group-hover:text-emerald-800 transition-colors">
                  Sanctuary Settings
                </h4>
                <p className="text-xs text-gray-500 font-medium">Security & address book</p>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-emerald-50 flex items-center justify-center transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )

  /* ═══════════════════════════════════════════════════════════════
     ORDERS HISTORY TAB
  ═══════════════════════════════════════════════════════════════ */
  const renderOrders = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-emerald-950/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
            Order History
          </span>
          <h2 className="text-3xl font-serif font-black text-[#11311F] tracking-tight">
            Your Botanical Deliveries
          </h2>
          <p className="text-gray-500 text-sm mt-0.5 font-medium">
            Monitor and track your plant shipments from nursery to door.
          </p>
        </div>

        {/* Filter Pills with Motion */}
        <div className="flex bg-emerald-50/70 p-1 rounded-2xl border border-emerald-100 self-start sm:self-auto">
          {[
            { id: 'all', label: `All (${orders.length})` },
            { id: 'transit', label: `In Transit (${transitOrders})` },
            { id: 'delivered', label: `Delivered (${completedOrders})` }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setOrderFilter(f.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                orderFilter === f.id
                  ? 'bg-[#11311F] text-white shadow-md'
                  : 'text-gray-600 hover:text-[#11311F]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loadingOrders ? (
        <div className="flex flex-col items-center justify-center py-24 text-emerald-800">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-600" />
          <p className="text-sm font-bold text-gray-500">Retrieving your botanical orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-emerald-100 border-dashed p-8 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4 text-emerald-700">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-serif font-black text-xl text-[#11311F] mb-1">No Orders Located</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Your sanctuary is ready for new greenery. Explore our exquisite collection of rare indoor plants.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#11311F] text-white rounded-2xl text-sm font-bold shadow-md hover:bg-black transition-colors"
          >
            <span>Browse Collection</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'delivered'
            const isCancelled = order.status === 'cancelled'
            const dateStr = new Date(order.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })

            return (
              <motion.div 
                key={order.id}
                whileHover={{ y: -2 }}
                className="bg-white rounded-3xl border border-emerald-950/5 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row"
              >
                {/* Mobile Header */}
                <div className="md:hidden px-5 pt-4 pb-2 flex justify-between items-center border-b border-gray-50">
                  <div className="flex items-center gap-1.5">
                    {isDelivered ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    ) : isCancelled ? (
                      <Info className="w-4 h-4 text-red-500" />
                    ) : (
                      <Truck className="w-4 h-4 text-emerald-600" />
                    )}
                    <span className={`text-[11px] font-black uppercase tracking-wider ${
                      isDelivered ? 'text-emerald-700' : isCancelled ? 'text-red-500' : 'text-emerald-700'
                    }`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-gray-400">{dateStr}</span>
                </div>

                {/* Main Card Body */}
                <div className="p-5 lg:p-6 flex gap-5 flex-1 items-center">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-[#F6F9F7] border border-emerald-100/60 overflow-hidden shrink-0 flex items-center justify-center p-2">
                    {order.order_items?.[0]?.products?.image_url ? (
                      <img 
                        src={order.order_items[0].products.image_url} 
                        alt="Product"
                        className="w-full h-full object-contain mix-blend-multiply" 
                      />
                    ) : (
                      <Package className="w-8 h-8 text-gray-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="hidden md:flex justify-between items-center mb-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                        Order #{order.id.split('-')[0].toUpperCase()} • {dateStr}
                      </p>
                    </div>

                    <h4 className="font-serif font-black text-base lg:text-lg text-[#11311F] truncate">
                      {order.order_items?.[0]?.products?.title || 'Botanical Wonder'}
                    </h4>

                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {order.order_items?.length > 1 
                        ? `+ ${order.order_items.length - 1} other botanical additions` 
                        : 'Single Plant Shipment'}
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-serif font-black text-[#11311F] text-xl">
                        ₹{Number(order.total_amount || 0).toLocaleString('en-IN')}
                      </span>

                      <div className="hidden md:block">
                        {isDelivered ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/50">
                            <CheckCircle className="w-3.5 h-3.5" /> Delivered
                          </div>
                        ) : isCancelled ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-200/50">
                            <Info className="w-3.5 h-3.5" /> Cancelled
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-200">
                            <Truck className="w-3.5 h-3.5" /> In Transit
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Rail */}
                <div className="px-5 py-4 bg-[#F8FAF9] border-t border-emerald-950/5 flex flex-wrap items-center justify-end gap-2.5 md:flex-col md:justify-center md:border-t-0 md:border-l md:w-48">
                  <button 
                    onClick={() => setViewModal({ open: true, order })} 
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-white transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Details
                  </button>
                  
                  {!isCancelled && !isDelivered && (
                    <button 
                      onClick={() => setCancelModal({ open: true, orderId: order.id, loading: false })} 
                      className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Ban className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}

                  {!isCancelled && (
                    <button 
                      onClick={() => isDelivered ? handleReorder(order) : setTrackModal({ open: true, order })} 
                      className="px-4 py-2 bg-[#11311F] text-white rounded-xl text-xs font-bold shadow-sm hover:bg-black transition-colors flex-1 md:flex-none md:w-full flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isDelivered ? (
                        <><RotateCcw className="w-3.5 h-3.5" /> Order Again</>
                      ) : (
                        <><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Track Order</>
                      )}
                    </button>
                  )}
                </div>

              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )

  /* ═══════════════════════════════════════════════════════════════
     SANCTUARY SETTINGS TAB
  ═══════════════════════════════════════════════════════════════ */
  const renderSettings = () => (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="pb-6 border-b border-emerald-950/5">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 block mb-1">
          Account Preferences
        </span>
        <h2 className="text-3xl font-serif font-black text-[#11311F] tracking-tight">
          Sanctuary Settings
        </h2>
        <p className="text-gray-500 text-sm mt-0.5 font-medium">
          Manage your account profile, registered email, and botanical membership.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-950/5 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Full Name
            </label>
            <input 
              type="text" 
              value={user?.name || 'Arogyavruksham Patron'} 
              disabled 
              className="w-full bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600 font-semibold cursor-not-allowed outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Registered Email
            </label>
            <input 
              type="email" 
              value={user?.email || 'Not provided'} 
              disabled 
              className="w-full bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600 font-semibold cursor-not-allowed outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Contact Number
            </label>
            <input 
              type="tel" 
              value={user?.phone || 'Not provided'} 
              disabled 
              className="w-full bg-[#F8FAF9] border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600 font-semibold cursor-not-allowed outline-none" 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Botanical Membership Tier
            </label>
            <div className="w-full bg-emerald-50/60 border border-emerald-200/60 rounded-2xl px-4 py-3 text-sm text-emerald-800 font-bold flex items-center justify-between">
              <span>Gold Patron Guild</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">
            To modify your shipping address or registered contact details, reach out to our Botanical Concierge.
          </p>
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl text-xs font-bold transition-colors cursor-pointer w-full sm:w-auto shrink-0"
          >
            <LogOut className="w-4 h-4" /> Sign Out of Sanctuary
          </button>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-sans text-gray-900 pb-24 md:pb-0 relative flex">
      
      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP SIDEBAR (CLEAN, CREATIVE & AROGYAVRUKSHAM BRANDED)
      ═══════════════════════════════════════════════════════════════ */}
      <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-emerald-950/5 hidden md:flex flex-col sticky top-0 h-screen shrink-0 z-20 shadow-[4px_0_24px_rgba(17,49,31,0.02)]">
        
        {/* Brand Lockup: Logo + Arogyavruksham Name */}
        <div className="p-7 pb-6 border-b border-emerald-950/5">
          <Link href="/" className="flex items-center gap-3.5 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100/60 p-1.5 border border-emerald-200/60 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img 
                src="/logo.png" 
                alt="Arogyavruksham Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div className="flex flex-col">
              <h1 className="font-serif font-black text-xl text-[#11311F] tracking-tight leading-none">
                Arogyavruksham
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mt-1">
                Botanical Sanctuary
              </span>
            </div>
          </Link>
          
          <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/50">
            <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            <span className="text-[10px] text-emerald-900 font-black uppercase tracking-widest">
              Verified Patron
            </span>
          </div>
        </div>

        {/* Sidebar Nav with Figma Animated Pills */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Sanctuary Overview', icon: LayoutDashboard },
            { id: 'orders', label: 'My Botanical Orders', icon: Clock },
            { id: 'settings', label: 'Sanctuary Settings', icon: Settings },
            ...(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor' 
              ? [{ id: 'admin', label: 'Admin Command', icon: ShieldCheck, onClick: () => router.push('/admin') }] 
              : []),
          ].map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button 
                key={item.id} 
                onClick={item.onClick || (() => setActiveTab(item.id as any))}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 cursor-pointer relative ${
                  isActive 
                    ? 'text-white shadow-md shadow-emerald-950/15' 
                    : 'text-gray-500 hover:bg-emerald-50/60 hover:text-[#11311F]'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="desktopTabActive"
                    className="absolute inset-0 bg-[#11311F] rounded-2xl"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-emerald-300' : 'text-gray-400'}`} />
                <span className="relative z-10">{item.label}</span>
              </button>
            )
          })}

          <div className="pt-4 px-2">
            <Link 
              href="/shop"
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/80 text-emerald-800 text-xs font-bold transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Leaf className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>Shop Rare Flora</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
            </Link>
          </div>
        </nav>

        {/* Botanical Concierge & Logout Box */}
        <div className="p-4 border-t border-emerald-950/5 bg-[#FAFAF8]/50 space-y-3">
          {/* Concierge Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-900 to-[#11311F] text-white shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">
                Plant Concierge
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 font-medium leading-snug">
              Need plant care advice or custom pots? Our botanists are here.
            </p>
            <Link 
              href="/contact"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-white transition-colors"
            >
              <span>Connect with Botanist</span> →
            </Link>
          </div>

          {/* Logout */}
          <button 
            onClick={handleLogout} 
            className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full px-3 py-2.5 rounded-xl border border-transparent hover:border-red-100 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ═══════════════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ═══════════════════════════════════════════════════════════════ */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-10 lg:p-12 relative z-10">
        
        {/* Mobile Top Bar */}
        <div className="md:hidden flex items-center justify-between mb-6 sticky top-0 bg-[#FAFAF8]/90 backdrop-blur-md py-3 z-20 border-b border-emerald-950/5">
          <button onClick={() => router.push('/')} className="p-2 -ml-2 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Arogyavruksham" className="w-7 h-7 object-contain" />
            <h1 className="font-serif font-black text-lg text-[#11311F]">Arogyavruksham</h1>
          </div>

          <button className="p-2 -mr-2 text-gray-500" onClick={() => setActiveTab('settings')}>
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <div key="dashboard">{renderDashboard()}</div>}
          {activeTab === 'orders' && <div key="orders">{renderOrders()}</div>}
          {activeTab === 'settings' && <div key="settings">{renderSettings()}</div>}
        </AnimatePresence>
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAV (KEPT INTACT)
      ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-100 flex items-center justify-around h-[72px] pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Home, onClick: () => setActiveTab('dashboard') },
          ...(user?.role === 'admin' || user?.role === 'manager' || user?.role === 'editor' 
            ? [{ id: 'admin', label: 'Admin', icon: LayoutDashboard, onClick: () => router.push('/admin') }] 
            : []),
          { id: 'orders', label: 'Orders', icon: Clock, onClick: () => setActiveTab('orders') },
          { id: 'shop', label: 'Shop', icon: Search, onClick: () => router.push('/shop') }
        ].map(item => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          
          return (
            <button 
              key={item.id} 
              onClick={item.onClick} 
              className="flex flex-col items-center justify-center gap-1 p-2 flex-1 cursor-pointer"
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-emerald-50 text-emerald-800' : 'text-gray-400'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold ${isActive ? 'text-[#11311F]' : 'text-gray-500'}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* ═══ SUCCESS TOAST ═══ */}
      {successToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#11311F] text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold border border-emerald-500/20">
            <CheckCircle className="w-4 h-4 text-emerald-400" /> {successToast}
          </div>
        </div>
      )}

      {/* ═══ CANCEL ORDER MODAL ═══ */}
      {cancelModal.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => !cancelModal.loading && setCancelModal({ open: false, orderId: '', loading: false })}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-red-500">
              <Ban className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-black text-xl text-[#11311F] mb-2">Cancel Order?</h3>
            <p className="text-gray-500 text-xs mb-6 leading-relaxed">
              This action cannot be reversed. Your botanical parcel will be cancelled and refund processed to original payment.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelModal({ open: false, orderId: '', loading: false })}
                disabled={cancelModal.loading}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelModal.loading}
                className="flex-1 py-3 bg-red-500 text-white rounded-2xl font-bold text-xs hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {cancelModal.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                {cancelModal.loading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRACK ORDER MODAL ═══ */}
      {trackModal.open && trackModal.order && (() => {
        const o = trackModal.order
        const steps = [
          { key: 'pending', label: 'Order Confirmed', desc: 'Plant selected in nursery' },
          { key: 'packed', label: 'Eco-Packed', desc: 'Moistened root-wrap & secured' },
          { key: 'shipped', label: 'In Transit', desc: 'En route via climate express' },
          { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Arriving at your doorstep today' },
          { key: 'delivered', label: 'Safely Delivered', desc: 'Ready for its new sanctuary' },
        ]
        const currentIdx = steps.findIndex(s => s.key === o.status)
        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setTrackModal({ open: false, order: null })}>
            <div className="bg-white rounded-t-3xl md:rounded-3xl p-7 lg:p-8 w-full md:max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif font-black text-xl text-[#11311F]">Botanical Tracking</h3>
                  <p className="text-xs text-gray-500">Real-time nursery shipment status</p>
                </div>
                <button onClick={() => setTrackModal({ open: false, order: null })} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-emerald-200 overflow-hidden flex items-center justify-center p-2 shrink-0">
                  {o.order_items?.[0]?.products?.image_url ? (
                    <img src={o.order_items[0].products.image_url} alt="Plant" className="w-full h-full object-contain mix-blend-multiply" />
                  ) : <Package className="w-6 h-6 text-emerald-700" />}
                </div>
                <div className="min-w-0">
                  <p className="font-serif font-bold text-[#11311F] text-sm truncate">{o.order_items?.[0]?.products?.title || 'Plant'}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Order #{o.id.split('-')[0].toUpperCase()}</p>
                  <p className="text-sm font-serif font-black text-[#11311F] mt-0.5">₹{Number(o.total_amount || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-0">
                {steps.map((step, i) => {
                  const done = i <= currentIdx
                  const isCurrent = i === currentIdx
                  return (
                    <div key={step.key} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          done ? 'bg-[#11311F] text-white' : 'bg-gray-100 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                          {done ? <CheckCircle className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                        </div>
                        {i < steps.length - 1 && <div className={`w-0.5 h-9 ${done ? 'bg-[#11311F]' : 'bg-gray-200'}`} />}
                      </div>
                      <div className={`pb-6 ${i === steps.length - 1 ? 'pb-0' : ''}`}>
                        <p className={`font-bold text-xs ${done ? 'text-[#11311F]' : 'text-gray-400'}`}>{step.label}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">{step.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══ VIEW MORE MODAL ═══ */}
      {viewModal.open && viewModal.order && (() => {
        const o = viewModal.order
        const dateStr = new Date(o.created_at).toLocaleDateString('en-US', { 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        })
        return (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewModal({ open: false, order: null })}>
            <div className="bg-white rounded-t-3xl md:rounded-3xl p-7 lg:p-8 w-full md:max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-serif font-black text-xl text-[#11311F]">Order Breakdown</h3>
                  <p className="text-xs text-gray-500">Official Arogyavruksham invoice details</p>
                </div>
                <button onClick={() => setViewModal({ open: false, order: null })} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Order ID</p>
                  <p className="font-mono font-bold text-[#11311F] text-xs mt-0.5">#{o.id.split('-')[0].toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Placed On</p>
                  <p className="font-bold text-[#11311F] text-xs mt-0.5">{dateStr}</p>
                </div>
              </div>

              <div className="space-y-3.5 mb-6">
                {o.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-3.5 items-center">
                    <div className="w-14 h-14 rounded-xl bg-[#F6F9F7] border border-emerald-100/60 overflow-hidden flex items-center justify-center p-1.5 shrink-0">
                      {item.products?.image_url ? (
                        <img src={item.products.image_url} alt="Plant" className="w-full h-full object-contain mix-blend-multiply" />
                      ) : <Package className="w-5 h-5 text-gray-300" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-[#11311F] text-xs truncate">{item.products?.title || 'Plant'}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-serif font-black text-[#11311F] text-xs shrink-0">
                      ₹{((item.price_at_time || 0) * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-bold capitalize ${
                    o.status === 'delivered' ? 'text-emerald-700' : o.status === 'cancelled' ? 'text-red-500' : 'text-emerald-800'
                  }`}>
                    {o.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-emerald-100 pt-2.5">
                  <span className="font-bold text-[#11311F]">Total Amount</span>
                  <span className="font-serif font-black text-[#11311F] text-base">
                    ₹{Number(o.total_amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

    </div>
  )
}
