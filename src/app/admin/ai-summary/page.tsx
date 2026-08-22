
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import {
  Radar, Loader2, AlertTriangle, ShoppingBag, Users, MessageSquare,
  TrendingUp, Lightbulb, Clock, ChevronRight, RefreshCw, Zap,
  PackageX, CreditCard, Globe, Search, Palette, Megaphone, Gauge,
  ArrowRight, ExternalLink, Shield, Eye
} from 'lucide-react'

type UrgentAlert = {
  type: string
  title: string
  description: string
  severity: 'critical' | 'warning' | 'info'
}

type OrdersSummary = {
  total24h: number
  revenue24h: number
  pendingCount: number
  codCount: number
  prepaidCount: number
  deliveredCount: number
  insight: string
}

type UncheckedOrder = {
  orderId: string
  customerName: string
  amount: number
  paymentMethod: string
  hoursAgo: number
  status: string
}

type CustomerIntel = {
  newCustomers24h: number
  chatSessions24h: number
  totalMessages24h: number
  sentiment: string
  topQuestions: string[]
  insight: string
}

type ChatHighlight = {
  role: string
  content: string
  timeAgo: string
}

type WebsiteImprovement = {
  category: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
}

type Recommendation = {
  priority: number
  title: string
  description: string
  action: string
}

type StructuredData = {
  urgentAlerts: UrgentAlert[]
  ordersSummary: OrdersSummary
  uncheckedOrders: UncheckedOrder[]
  customerIntel: CustomerIntel
  chatHighlights: ChatHighlight[]
  websiteImprovements: WebsiteImprovement[]
  recommendations: Recommendation[]
}

type RawStats = {
  orders24h: number
  revenue24h: number
  newCustomers24h: number
  chatSessions24h: number
  chatMessages24h: number
  pendingOrders: number
  lowStockItems: number
  totalProducts: number
  outOfStock: number
  totalOrders: number
  totalRevenue: number
  codOrders24h: number
  prepaidOrders24h: number
  pendingOrdersList: Array<{
    id: string
    shortId: string
    customerName: string
    amount: number
    paymentMethod: string
    status: string
    createdAt: string
    hoursAgo: number
  }>
  recentChats: Array<{
    role: string
    content: string
    createdAt: string
  }>
  lowStockProducts: Array<{
    title: string
    stockCount: number
  }>
}

// Category icons for website improvements
const CATEGORY_ICONS: Record<string, any> = {
  SEO: Search,
  UX: Palette,
  Products: ShoppingBag,
  Marketing: Megaphone,
  Performance: Gauge,
}

// Severity colors
const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-500' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'HIGH' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'MED' },
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'LOW' },
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
}

function SectionHeader({ icon: Icon, title, badge }: { icon: any; title: string; badge?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-bold text-[#111827] flex items-center gap-2.5 text-[15px]">
        <div className="w-8 h-8 rounded-lg bg-[#059669]/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#059669]" strokeWidth={2} />
        </div>
        {title}
      </h3>
      {badge && (
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] bg-[#F3F4F6] px-3 py-1.5 rounded-full">
          {badge}
        </span>
      )}
    </div>
  )
}

export default function CommandCenterPage() {
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [structured, setStructured] = useState<StructuredData | null>(null)
  const [rawStats, setRawStats] = useState<RawStats | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeSection, setActiveSection] = useState<string>('all')

  const generateReport = useCallback(async () => {
    setGenerating(true)
    setError(null)
    try {
      const adminPassword = useAuthStore.getState().adminPassword
      const res = await fetch('/api/admin/chat-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({})
      })

      const data = await res.json()
      if (res.ok) {
        if (data.structured) {
          setStructured(data.structured)
        }
        if (data.stats) {
          setRawStats(data.stats)
        }
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGenerating(false)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  const stats = rawStats
  const data = structured

  // Section filter tabs
  const sections = [
    { id: 'all', label: 'All Sections' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'orders', label: 'Orders' },
    { id: 'customers', label: 'Customers' },
    { id: 'chats', label: 'Chats' },
    { id: 'improvements', label: 'Improvements' },
    { id: 'recommendations', label: 'Actions' },
  ]

  const showSection = (id: string) => activeSection === 'all' || activeSection === id

  return (
    <div className="space-y-6 text-[#111827] font-sans pb-12">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#059669] flex items-center justify-center shadow-[0_4px_14px_rgba(5,150,105,0.3)]">
              <Radar className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            Command Center
          </h1>
          <p className="text-sm font-semibold text-[#6B7280] mt-1.5 ml-[52px]">
            AI-powered business intelligence hub for your store
          </p>
        </div>
        <div className="flex items-center gap-3 ml-[52px] sm:ml-0">
          <div className="flex items-center gap-2 bg-emerald-50 text-[#059669] px-3 py-1.5 border border-emerald-200 rounded-xl text-xs font-bold">
            <div className="w-2 h-2 bg-[#059669] rounded-full animate-pulse" />
            GLM 5.2 Active
          </div>
          <button
            onClick={generateReport}
            disabled={generating}
            className="flex items-center gap-2 bg-[#059669] text-white px-4 py-2 rounded-xl text-sm font-bold hover:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(5,150,105,0.3)] disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} strokeWidth={2} />
            {generating ? 'Analyzing...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* ─── Last Updated + Section Tabs ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full sm:w-auto">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                activeSection === s.id
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:bg-[#F3F4F6]'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        {lastUpdated && (
          <span className="text-[11px] font-bold text-[#9CA3AF] flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
            Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </div>

      {/* ─── Loading State ─── */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-28" />)}
          </div>
          <SkeletonBlock className="h-40" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonBlock className="h-64" />
            <SkeletonBlock className="h-64" />
          </div>
        </div>
      )}

      {/* ─── Error State ─── */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <p className="font-bold text-red-700 text-sm">Analysis Failed</p>
            <p className="text-red-600 text-xs mt-1">{error}</p>
            <button
              onClick={generateReport}
              className="mt-3 text-xs font-bold text-red-700 underline underline-offset-2 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ─── Progress Bar ─── */}
      {generating && !loading && (
        <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-[#059669] rounded-full animate-[progress_1.5s_ease-in-out_infinite] w-1/2" />
        </div>
      )}

      {/* ─── Main Content ─── */}
      {!loading && stats && (
        <>
          {/* ─── Quick Stat Cards ─── */}
          {showSection('orders') && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Orders (24h)',
                  value: stats.orders24h,
                  sub: `${stats.totalOrders} all-time`,
                  icon: ShoppingBag,
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
                {
                  label: 'Revenue (24h)',
                  value: `₹${stats.revenue24h.toLocaleString('en-IN')}`,
                  sub: `₹${stats.totalRevenue.toLocaleString('en-IN')} all-time`,
                  icon: TrendingUp,
                  color: 'text-emerald-600',
                  bg: 'bg-emerald-50',
                },
                {
                  label: 'Pending Orders',
                  value: stats.pendingOrders,
                  sub: 'Needs attention',
                  icon: Clock,
                  color: stats.pendingOrders > 0 ? 'text-amber-600' : 'text-gray-400',
                  bg: stats.pendingOrders > 0 ? 'bg-amber-50' : 'bg-gray-50',
                },
                {
                  label: 'New Customers',
                  value: stats.newCustomers24h,
                  sub: `${stats.chatMessages24h} chat msgs`,
                  icon: Users,
                  color: 'text-purple-600',
                  bg: 'bg-purple-50',
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} strokeWidth={1.5} />
                    </div>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-[#111827]">{card.value}</p>
                  <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mt-1">{card.label}</p>
                  <p className="text-[10px] font-semibold text-[#9CA3AF] mt-0.5">{card.sub}</p>
                </div>
              ))}
            </div>
          )}

          {/* ─── Section 1: Urgent Alerts ─── */}
          {showSection('alerts') && data?.urgentAlerts && data.urgentAlerts.length > 0 && (
            <div className="space-y-3">
              <SectionHeader icon={AlertTriangle} title="Urgent Alerts" badge={`${data.urgentAlerts.length} ACTIVE`} />
              <div className="space-y-2.5">
                {data.urgentAlerts.map((alert, i) => {
                  const styles = SEVERITY_STYLES[alert.severity] || SEVERITY_STYLES.info
                  return (
                    <div
                      key={i}
                      className={`${styles.bg} ${styles.border} border rounded-xl p-4 flex items-start gap-3`}
                    >
                      <AlertTriangle className={`w-4.5 h-4.5 ${styles.icon} shrink-0 mt-0.5`} strokeWidth={2} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className={`font-bold text-sm ${styles.text}`}>{alert.title}</p>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${styles.bg} ${styles.text} px-2 py-0.5 rounded-full border ${styles.border}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${styles.text} opacity-80`}>{alert.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── Section 2: Unchecked Orders ─── */}
          {showSection('orders') && stats.pendingOrdersList && stats.pendingOrdersList.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
              <div className="p-5 pb-3">
                <SectionHeader icon={PackageX} title="Unchecked Orders" badge={`${stats.pendingOrdersList.length} PENDING`} />
                <p className="text-xs text-[#6B7280] font-medium -mt-2 ml-[42px]">
                  These orders need your attention — review and update their status.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-y border-[#E5E7EB] text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold">
                      <th className="p-3 pl-5">Order</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 pr-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.pendingOrdersList.map((order, i) => (
                      <tr key={i} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="p-3 pl-5 font-black font-mono text-[#111827] text-xs">#{order.shortId}</td>
                        <td className="p-3 font-bold text-[#374151] text-xs">{order.customerName}</td>
                        <td className="p-3 font-black text-[#111827]">₹{Number(order.amount).toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                            order.paymentMethod === 'Cash on Delivery'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {order.paymentMethod === 'Cash on Delivery' ? 'COD' : 'Prepaid'}
                          </span>
                        </td>
                        <td className="p-3 text-xs font-semibold text-[#6B7280]">{order.hoursAgo}h ago</td>
                        <td className="p-3 pr-5">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded-full border border-[#E5E7EB]">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                <a
                  href="/admin/orders"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-[#059669] hover:text-[#047857] transition-colors cursor-pointer"
                >
                  View All Orders <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </a>
              </div>
            </div>
          )}

          {/* ─── Section 3: Customer Intelligence ─── */}
          {showSection('customers') && data?.customerIntel && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
                <SectionHeader icon={Users} title="Customer Intelligence" badge="24H" />
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'New Customers', value: data.customerIntel.newCustomers24h },
                    { label: 'Chat Sessions', value: data.customerIntel.chatSessions24h },
                    { label: 'Messages', value: data.customerIntel.totalMessages24h },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#F9FAFB] rounded-xl p-3 text-center border border-[#E5E7EB]">
                      <p className="text-xl font-black text-[#111827]">{s.value}</p>
                      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Sentiment */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Sentiment</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                    data.customerIntel.sentiment === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : data.customerIntel.sentiment === 'negative' ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                  }`}>
                    {data.customerIntel.sentiment}
                  </span>
                </div>

                <p className="text-xs text-[#374151] leading-relaxed font-medium">{data.customerIntel.insight}</p>

                {/* Top Questions */}
                {data.customerIntel.topQuestions && data.customerIntel.topQuestions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                    <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2.5">Top Questions</p>
                    <div className="space-y-2">
                      {data.customerIntel.topQuestions.map((q, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-[#374151]">
                          <MessageSquare className="w-3.5 h-3.5 text-[#9CA3AF] shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="font-medium">{q}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ─── Section 4: Chat Highlights ─── */}
              {showSection('chats') && (
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5 flex flex-col">
                  <SectionHeader icon={MessageSquare} title="Recent Chat Highlights" badge={`${stats?.chatMessages24h || 0} MSGS`} />
                  {stats?.recentChats && stats.recentChats.length > 0 ? (
                    <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
                      {stats.recentChats.map((chat, i) => {
                        const isUser = chat.role === 'user'
                        const timeStr = new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        return (
                          <div
                            key={i}
                            className={`rounded-xl p-3 text-xs border ${
                              isUser
                                ? 'bg-[#F9FAFB] border-[#E5E7EB]'
                                : 'bg-emerald-50/50 border-emerald-100'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                isUser ? 'text-blue-600' : 'text-[#059669]'
                              }`}>
                                {isUser ? '👤 Customer' : '🤖 AI Bot'}
                              </span>
                              <span className="text-[10px] font-semibold text-[#9CA3AF]">{timeStr}</span>
                            </div>
                            <p className="text-[#374151] font-medium leading-relaxed line-clamp-3">{chat.content}</p>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-[#9CA3AF] text-xs font-medium">
                      No chat messages in the last 24 hours
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ─── Section 5: Website Improvements ─── */}
          {showSection('improvements') && data?.websiteImprovements && data.websiteImprovements.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
              <SectionHeader icon={Globe} title="Website Improvement Suggestions" badge="AI ANALYSIS" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {data.websiteImprovements.map((imp, i) => {
                  const Icon = CATEGORY_ICONS[imp.category] || Lightbulb
                  const priorityStyle = PRIORITY_STYLES[imp.priority] || PRIORITY_STYLES.medium
                  return (
                    <div
                      key={i}
                      className="border border-[#E5E7EB] rounded-xl p-4 hover:shadow-[0_4px_14px_rgb(0,0,0,0.04)] transition-shadow group"
                    >
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                            <Icon className="w-3.5 h-3.5 text-[#6B7280]" strokeWidth={2} />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">{imp.category}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${priorityStyle.bg} ${priorityStyle.text}`}>
                          {priorityStyle.label}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#111827] mb-1.5">{imp.title}</h4>
                      <p className="text-xs text-[#6B7280] leading-relaxed font-medium">{imp.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ─── Section 6: AI Recommendations ─── */}
          {showSection('recommendations') && data?.recommendations && data.recommendations.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
              <SectionHeader icon={Zap} title="AI Recommendations" badge="TOP ACTIONS" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="relative border border-[#E5E7EB] rounded-xl p-5 hover:shadow-[0_4px_14px_rgb(0,0,0,0.04)] hover:border-[#059669]/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                        i === 0 ? 'bg-[#059669] text-white shadow-[0_4px_14px_rgba(5,150,105,0.3)]'
                        : i === 1 ? 'bg-[#111827] text-white'
                        : 'bg-[#F3F4F6] text-[#6B7280] border border-[#E5E7EB]'
                      }`}>
                        #{rec.priority}
                      </div>
                      <h4 className="font-bold text-sm text-[#111827] flex-1">{rec.title}</h4>
                    </div>
                    <p className="text-xs text-[#6B7280] leading-relaxed font-medium mb-3">{rec.description}</p>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#059669] group-hover:text-[#047857] transition-colors">
                      <Zap className="w-3.5 h-3.5" strokeWidth={2} />
                      <span>{rec.action}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Low Stock Products ─── */}
          {showSection('alerts') && stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-5">
              <SectionHeader icon={Shield} title="Low Stock Products" badge={`${stats.lowStockProducts.length} ITEMS`} />
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {stats.lowStockProducts.map((p, i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-3.5 border ${
                      p.stockCount === 0
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                    }`}
                  >
                    <p className="font-bold text-sm text-[#111827] truncate mb-1" title={p.title}>{p.title}</p>
                    <p className={`text-xs font-black ${p.stockCount === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                      {p.stockCount === 0 ? 'OUT OF STOCK' : `${p.stockCount} left`}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-[#E5E7EB]">
                <a
                  href="/admin/inventory"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-[#059669] hover:text-[#047857] transition-colors cursor-pointer"
                >
                  Manage Inventory <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </a>
              </div>
            </div>
          )}

          {/* ─── Orders Summary Insight ─── */}
          {showSection('orders') && data?.ordersSummary?.insight && (
            <div className="bg-[#059669] text-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(5,150,105,0.2)]">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                  <Eye className="w-4.5 h-4.5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="font-bold text-sm mb-1">AI Order Insight</h4>
                  <p className="text-sm text-emerald-100 leading-relaxed font-medium">
                    {data.ordersSummary.insight}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ─── Fallback: No structured data ─── */}
          {!data && !error && !generating && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="font-bold text-amber-700 text-sm">AI response couldn&apos;t be parsed</p>
                <p className="text-amber-600 text-xs mt-1">The AI model returned a response that couldn&apos;t be structured. Try regenerating the report.</p>
                <button
                  onClick={generateReport}
                  className="mt-3 text-xs font-bold text-amber-700 underline underline-offset-2 cursor-pointer"
                >
                  Regenerate Report
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
