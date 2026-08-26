'use client'

import { useEffect, useState, useMemo } from 'react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { useAuthStore } from '@/store/authStore'
import { Search, Mail, Send, AlertCircle, CheckCircle2, XCircle, Package, Truck, Clock, Filter, ChevronDown, ChevronUp, ExternalLink, RefreshCw, X, Eye, ShoppingCart, Zap, KeyRound } from 'lucide-react'

interface SentEmail {
  id: string
  order_id: string | null
  recipient_email: string
  recipient_name: string | null
  email_type: string
  subject: string
  status: 'sent' | 'failed'
  error_message: string | null
  metadata: Record<string, any>
  html_preview: string | null
  created_at: string
}

interface EmailStats {
  total: number
  sent: number
  failed: number
  orderConfirmation: number
  statusUpdates: number
  productLaunch: number
  otp: number
}

const EMAIL_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  order_confirmation: { label: 'Order Confirmed', color: '#1E4631', bg: '#F0F7F2', icon: ShoppingCart },
  status_packed: { label: 'Packed', color: '#7C5E10', bg: '#FFF8E7', icon: Package },
  status_shipped: { label: 'Shipped', color: '#1565C0', bg: '#E3F2FD', icon: Truck },
  status_out_for_delivery: { label: 'Out for Delivery', color: '#E65100', bg: '#FFF3E0', icon: Truck },
  status_delivered: { label: 'Delivered', color: '#2E7D32', bg: '#E8F5E9', icon: CheckCircle2 },
  status_cancelled: { label: 'Cancelled', color: '#C62828', bg: '#FFEBEE', icon: XCircle },
  product_launch: { label: 'Product Launch', color: '#6A1B9A', bg: '#F3E5F5', icon: Zap },
  otp: { label: 'Login OTP', color: '#455A64', bg: '#ECEFF1', icon: KeyRound },
}

function getTypeConfig(type: string) {
  return EMAIL_TYPE_CONFIG[type] || { label: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), color: '#555', bg: '#F5F5F5', icon: Mail }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFullDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
}

export default function MailsManagerPage() {
  const { adminPassword } = useAuthStore()
  const [emails, setEmails] = useState<SentEmail[]>([])
  const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, failed: 0, orderConfirmation: 0, statusUpdates: 0, productLaunch: 0, otp: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [previewEmail, setPreviewEmail] = useState<SentEmail | null>(null)
  const limit = 30

  const fetchEmails = async () => {
    if (!adminPassword) return
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      if (search) params.set('search', search)

      const res = await fetch(`/api/admin/emails?${params.toString()}`, {
        headers: { Authorization: `Bearer ${adminPassword}` },
      })
      const json = await res.json()
      if (res.ok) {
        setEmails(json.emails || [])
        setTotalCount(json.total || 0)
        setStats(json.stats || stats)
      }
    } catch (err) {
      console.error('Failed to fetch emails:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEmails()
  }, [adminPassword, page, typeFilter, statusFilter])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1)
      fetchEmails()
    }, 400)
    return () => clearTimeout(timer)
  }, [search])

  const totalPages = Math.ceil(totalCount / limit)

  const statCards = [
    { label: 'Total Sent', value: stats.total, icon: Send, color: '#1E4631', bg: '#F0F7F2' },
    { label: 'Order Confirmations', value: stats.orderConfirmation, icon: ShoppingCart, color: '#1565C0', bg: '#E3F2FD' },
    { label: 'Status Updates', value: stats.statusUpdates, icon: Truck, color: '#E65100', bg: '#FFF3E0' },
    { label: 'Failed', value: stats.failed, icon: XCircle, color: '#C62828', bg: '#FFEBEE' },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader 
        eyebrow="Communication"
        title="Mails Manager"
        description="Track all emails sent to customers — order confirmations, shipping updates, and more."
        actions={
          <button 
            onClick={() => { setPage(1); fetchEmails() }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-xl text-sm font-bold hover:bg-emerald-950 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        }
      />

      {/* ──── Stats Cards ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div 
            key={card.label}
            className="rounded-2xl p-5 border border-gray-100 transition-all hover:shadow-md"
            style={{ backgroundColor: card.bg }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${card.color}15` }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <p className="text-3xl font-black tracking-tight" style={{ color: card.color }}>
              {card.value.toLocaleString()}
            </p>
            <p className="text-xs font-semibold text-gray-500 mt-1 uppercase tracking-wider">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* ──── Filters ──── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by email, name, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none cursor-pointer min-w-[180px]"
          >
            <option value="">All Types</option>
            <option value="order_confirmation">Order Confirmation</option>
            <option value="status_packed">Packed</option>
            <option value="status_shipped">Shipped</option>
            <option value="status_out_for_delivery">Out for Delivery</option>
            <option value="status_delivered">Delivered</option>
            <option value="status_cancelled">Cancelled</option>
            <option value="product_launch">Product Launch</option>
            <option value="otp">Login OTP</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="pl-4 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200 appearance-none cursor-pointer min-w-[130px]"
          >
            <option value="">All Status</option>
            <option value="sent">✅ Sent</option>
            <option value="failed">❌ Failed</option>
          </select>
        </div>
      </div>

      {/* ──── Emails Table ──── */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-700 rounded-full animate-spin" />
              <p className="text-sm text-gray-400 font-medium">Loading emails...</p>
            </div>
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No emails found</p>
            <p className="text-gray-400 text-xs">Emails will appear here once orders are placed</p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-gray-50/80 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <div className="col-span-3">Recipient</div>
              <div className="col-span-3">Subject</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2">Sent</div>
              <div className="col-span-1 text-center">Details</div>
            </div>

            {/* Rows */}
            {emails.map((email) => {
              const typeConfig = getTypeConfig(email.email_type)
              const TypeIcon = typeConfig.icon
              const isExpanded = expandedId === email.id

              return (
                <div key={email.id}>
                  {/* Main Row */}
                  <div 
                    className={`grid grid-cols-12 gap-3 px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer items-center ${isExpanded ? 'bg-gray-50/70' : ''}`}
                    onClick={() => setExpandedId(isExpanded ? null : email.id)}
                  >
                    {/* Recipient */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {email.recipient_name || '—'}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {email.recipient_email}
                      </p>
                    </div>

                    {/* Subject */}
                    <div className="col-span-3 min-w-0">
                      <p className="text-sm text-gray-700 truncate" title={email.subject}>
                        {email.subject}
                      </p>
                    </div>

                    {/* Type Badge */}
                    <div className="col-span-2">
                      <span 
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
                        style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                      >
                        <TypeIcon className="w-3 h-3" />
                        {typeConfig.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      {email.status === 'sent' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 font-medium">
                        {formatDate(email.created_at)}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(email.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {/* Expand toggle */}
                    <div className="col-span-1 text-center">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 py-4 bg-gray-50/50 border-b border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Email Details */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Details</h4>
                          
                          <div className="grid grid-cols-2 gap-y-3 text-sm">
                            <span className="text-gray-400 font-medium">Recipient:</span>
                            <span className="text-gray-900 font-semibold">{email.recipient_email}</span>

                            <span className="text-gray-400 font-medium">Name:</span>
                            <span className="text-gray-900">{email.recipient_name || '—'}</span>

                            <span className="text-gray-400 font-medium">Type:</span>
                            <span>
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                                style={{ backgroundColor: typeConfig.bg, color: typeConfig.color }}
                              >
                                {typeConfig.label}
                              </span>
                            </span>

                            <span className="text-gray-400 font-medium">Status:</span>
                            <span className={`font-bold ${email.status === 'sent' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {email.status === 'sent' ? '✅ Delivered' : '❌ Failed'}
                            </span>

                            <span className="text-gray-400 font-medium">Sent At:</span>
                            <span className="text-gray-900">{formatFullDate(email.created_at)}</span>

                            {email.order_id && (
                              <>
                                <span className="text-gray-400 font-medium">Order ID:</span>
                                <span className="text-gray-900 font-mono text-xs">
                                  {email.order_id.split('-')[0].toUpperCase()}
                                </span>
                              </>
                            )}
                          </div>

                          {email.error_message && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                              <p className="text-xs font-bold text-red-700 mb-1">Error Message</p>
                              <p className="text-xs text-red-600 font-mono">{email.error_message}</p>
                            </div>
                          )}
                        </div>

                        {/* Right: Metadata */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Metadata</h4>
                          
                          {email.metadata && Object.keys(email.metadata).length > 0 ? (
                            <div className="space-y-2">
                              {email.metadata.totalAmount !== undefined && (
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <span className="text-xs text-gray-500">Order Total</span>
                                  <span className="text-sm font-bold text-gray-900">₹{Number(email.metadata.totalAmount).toLocaleString('en-IN')}</span>
                                </div>
                              )}
                              {email.metadata.itemCount !== undefined && (
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <span className="text-xs text-gray-500">Items</span>
                                  <span className="text-sm font-bold text-gray-900">{email.metadata.itemCount}</span>
                                </div>
                              )}
                              {email.metadata.paymentMethod && (
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <span className="text-xs text-gray-500">Payment</span>
                                  <span className="text-sm font-semibold text-gray-900">{email.metadata.paymentMethod}</span>
                                </div>
                              )}
                              {email.metadata.newStatus && (
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <span className="text-xs text-gray-500">New Status</span>
                                  <span className="text-sm font-semibold text-gray-900 capitalize">{email.metadata.newStatus.replace(/_/g, ' ')}</span>
                                </div>
                              )}
                              {email.metadata.productTitle && (
                                <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-100">
                                  <span className="text-xs text-gray-500">Product</span>
                                  <span className="text-sm font-semibold text-gray-900">{email.metadata.productTitle}</span>
                                </div>
                              )}
                              {email.metadata.items && email.metadata.items.length > 0 && (
                                <div className="p-2.5 bg-white rounded-lg border border-gray-100">
                                  <p className="text-xs text-gray-500 mb-2">Order Items</p>
                                  {email.metadata.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between py-1 text-xs">
                                      <span className="text-gray-700">{item.name} × {item.quantity}</span>
                                      <span className="text-gray-900 font-semibold">{item.price}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {email.metadata.hasInvoice && (
                                <div className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                                  <span className="text-xs text-amber-700 font-semibold">📄 Invoice PDF attached</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400 italic">No additional metadata</p>
                          )}

                          {/* View Email Preview Button */}
                          {email.html_preview && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); setPreviewEmail(email) }}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-900 text-white rounded-lg text-xs font-bold hover:bg-emerald-950 transition-colors mt-3"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              View Email Preview
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* ──── Pagination ──── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500 font-medium px-3">
              Page {page} of {totalPages}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium disabled:opacity-30 hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ──── Email Preview Modal ──── */}
      {previewEmail && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewEmail(null)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Email Preview</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Sent to {previewEmail.recipient_email} on {formatFullDate(previewEmail.created_at)}
                </p>
              </div>
              <button 
                onClick={() => setPreviewEmail(null)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-16">Subject:</span>
                  <span className="text-sm text-gray-900 font-medium">{previewEmail.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-16">To:</span>
                  <span className="text-sm text-gray-900">{previewEmail.recipient_name ? `${previewEmail.recipient_name} <${previewEmail.recipient_email}>` : previewEmail.recipient_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-400 w-16">Type:</span>
                  {(() => {
                    const tc = getTypeConfig(previewEmail.email_type)
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: tc.bg, color: tc.color }}>
                        {tc.label}
                      </span>
                    )
                  })()}
                </div>
              </div>

              {previewEmail.html_preview && (
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">HTML Preview (first 500 characters)</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {previewEmail.html_preview}
                  </pre>
                </div>
              )}

              {/* Full Metadata */}
              {previewEmail.metadata && Object.keys(previewEmail.metadata).length > 0 && (
                <div className="border border-gray-100 rounded-xl p-4 bg-gray-50 mt-4">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Metadata</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                    {JSON.stringify(previewEmail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
