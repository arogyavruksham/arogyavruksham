'use client'

import { useState, useEffect } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Plus, Search, Edit2, Trash2, Tag, Loader2 } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

type Coupon = {
  id: string
  code: string
  title: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  start_date: string
  expiry_date: string
  is_active: boolean
  usage_count: number
  usage_limit: number | null
}

function toLocalDateTimeInput(d?: string | Date) {
  const date = d ? new Date(d) : new Date();
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function OffersPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [searchFilter, setSearchFilter] = useState('')
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    start_date: toLocalDateTimeInput(),
    expiry_date: '',
    is_active: true,
    usage_limit: ''
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function fetchCoupons() {
    setLoading(true)
    try {
      const { data, error } = await adminDbProxy({
        action: 'select',
        table: 'coupons',
        order: { column: 'created_at', ascending: false }
      })
      if (data) setCoupons(data)
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id)
      setFormData({
        code: coupon.code,
        title: coupon.title,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value.toString(),
        start_date: toLocalDateTimeInput(coupon.start_date),
        expiry_date: toLocalDateTimeInput(coupon.expiry_date),
        is_active: coupon.is_active,
        usage_limit: coupon.usage_limit !== null && coupon.usage_limit !== undefined ? coupon.usage_limit.toString() : ''
      })
    } else {
      setEditingId(null)
      setFormData({
        code: '',
        title: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: toLocalDateTimeInput(),
        expiry_date: '',
        is_active: true,
        usage_limit: ''
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    const payload = {
      ...formData,
      code: formData.code.toUpperCase(),
      discount_value: Number(formData.discount_value),
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
      expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null
    }

    try {
      if (editingId) {
        await adminDbProxy({
          action: 'update',
          table: 'coupons',
          data: payload,
          match: { id: editingId }
        })
      } else {
        await adminDbProxy({
          action: 'insert',
          table: 'coupons',
          data: payload
        })
      }
      setIsModalOpen(false)
      fetchCoupons()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDelete = (id: string) => {
    setDeletingId(id)
  }

  const confirmDelete = async () => {
    if (!deletingId) return
    setIsProcessing(true)
    try {
      await adminDbProxy({
        action: 'delete',
        table: 'coupons',
        match: { id: deletingId }
      })
      setDeletingId(null)
      fetchCoupons()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredCoupons = coupons.filter(c => {
    if (!searchFilter.trim()) return true;
    return c.code.toLowerCase().includes(searchFilter.toLowerCase()) || c.title.toLowerCase().includes(searchFilter.toLowerCase());
  })

  return (
    <div className="space-y-6 text-[#111827] font-sans pb-12">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Offers & Coupons"
        description="Create promo codes, set discount windows, and track how often each coupon is used."
      />
      
      {/* Top Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search offers & codes..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none text-sm font-semibold text-[#111827] placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-[#059669] text-white shadow-sm border-0 hover:bg-[#047857] rounded-lg text-sm font-bold hover:bg-gray-900 transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      {/* Offers Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[750px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs uppercase tracking-wider text-[#6B7280] font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" /></th>
                <th className="p-4 font-bold">OFFER TITLE</th>
                <th className="p-4 font-bold">PROMO CODE</th>
                <th className="p-4 font-bold">DISCOUNT VALUE</th>
                <th className="p-4 font-bold">USAGE</th>
                <th className="p-4 font-bold">VALIDITY WINDOW</th>
                <th className="p-4 font-bold">STATUS</th>
                <th className="p-4 pr-6 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-14 text-center text-[#6B7280]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#111827] mx-auto mb-2" />
                    <span className="text-xs font-bold text-[#374151]">Loading discount vouchers...</span>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-14 text-center text-[#9CA3AF] italic">
                    No active coupons found in catalog. Click "Add Coupon" to generate one.
                  </td>
                </tr>
              ) : filteredCoupons.map((coupon) => {
                const now = Date.now()
                const start = new Date(coupon.start_date).getTime()
                const end = new Date(coupon.expiry_date).getTime()
                let statusBadge = { label: 'Active', classes: 'bg-green-50 text-green-700 border-green-200/60' }
                if (!coupon.is_active) statusBadge = { label: 'Inactive', classes: 'bg-[#E5E7EB] text-[#6B7280] border-[#E5E7EB]' }
                else if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) statusBadge = { label: 'Limit Reached', classes: 'bg-red-50 text-red-700 border-red-200/60' }
                else if (now > end) statusBadge = { label: 'Expired', classes: 'bg-red-50 text-red-700 border-red-200/60' }
                else if (now < start) statusBadge = { label: 'Scheduled', classes: 'bg-amber-50 text-amber-700 border-amber-200/60' }

                return (
                  <tr key={coupon.id} className="hover:bg-[#F9FAFB]/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" />
                    </td>
                    <td className="p-4 font-bold text-[#111827] text-sm">{coupon.title}</td>
                    <td className="p-4">
                      <span className="bg-[#E5E7EB] text-[#111827] px-3 py-1 rounded-lg font-mono text-xs font-black border border-[#E5E7EB] shadow-2xs">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="p-4 font-black text-[#111827] text-base">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}% OFF` : `₹${coupon.discount_value} OFF`}
                    </td>
                    <td className="p-4 text-sm font-semibold text-[#374151]">
                      {coupon.usage_count} / {coupon.usage_limit === null ? '∞' : coupon.usage_limit}
                    </td>
                    <td className="p-4 text-xs font-mono text-[#4B5563] space-y-0.5">
                      <div><span className="font-bold text-[#9CA3AF]">START:</span> {new Date(coupon.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      <div><span className="font-bold text-[#9CA3AF]">EXPIRES:</span> {new Date(coupon.expiry_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-0.5 rounded-full text-xs font-bold border ${statusBadge.classes}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(coupon)} className="p-2 text-[#9CA3AF] hover:text-[#111827] hover:bg-[#E5E7EB] rounded-lg transition-colors cursor-pointer" title="Edit Coupon">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete Coupon">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#059669] shadow-sm border-0/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden border border-[#E5E7EB]">
            <div className="px-6 py-5 border-b border-[#E5E7EB] flex justify-between items-center bg-[#F9FAFB]">
              <h2 className="text-lg font-black text-[#111827] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#111827]" /> {editingId ? 'Modify Coupon Offer' : 'Create New Coupon'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Coupon Promo Code</label>
                <input required type="text" placeholder="e.g. MONSOON30" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-mono font-bold uppercase text-sm" />
              </div>

              <div>
                <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Offer Title</label>
                <input required type="text" placeholder="e.g. Monsoon Special 30% Discount" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-semibold text-sm" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-semibold text-sm cursor-pointer">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Value</label>
                  <input required type="number" min="1" step="0.01" placeholder="30" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-bold text-sm" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Usage Limit</label>
                  <input type="number" min="1" placeholder="Unlimited if left empty" value={formData.usage_limit} onChange={e => setFormData({...formData, usage_limit: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-bold text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Start Timestamp</label>
                  <input required type="datetime-local" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-semibold text-xs font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#374151] uppercase tracking-wide mb-1.5">Expiry Timestamp</label>
                  <input required type="datetime-local" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2 bg-white border border-[#D1D5DB] rounded-lg outline-none focus:ring-1 focus:ring-[#059669] focus:border-[#059669] text-[#111827] font-semibold text-xs font-mono" />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-[#111827] border-[#D1D5DB] rounded focus:ring-[#059669] cursor-pointer" />
                <label htmlFor="isActive" className="text-xs font-bold text-[#374151] cursor-pointer">Coupon is active and available for customer checkout</label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-xs font-bold text-[#374151] bg-[#E5E7EB] hover:bg-gray-200 rounded-lg transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="flex-1 px-4 py-2.5 text-xs font-bold text-white bg-[#059669] hover:bg-gray-900 rounded-lg transition-all shadow-xs disabled:opacity-50 cursor-pointer">
                  {isProcessing ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-[#059669] shadow-sm border-0/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center border border-[#E5E7EB]">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <Trash2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-black text-[#111827] mb-2">Delete Coupon?</h2>
            <p className="text-xs text-[#6B7280] font-medium mb-6 leading-relaxed">Are you sure you want to permanently delete this discount voucher? Customers will no longer be able to claim it.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)} 
                className="flex-1 px-4 py-2.5 text-xs text-[#374151] bg-[#E5E7EB] hover:bg-gray-200 rounded-lg font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-xs text-white bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {isProcessing ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
