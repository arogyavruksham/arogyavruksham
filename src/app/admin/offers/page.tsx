'use client'

import { useState, useEffect } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Plus, Edit2, Trash2, Tag, Loader2 } from 'lucide-react'

type Coupon = {
  id: string
  code: string
  title: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  start_date: string
  expiry_date: string
  is_active: boolean
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
  
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    start_date: toLocalDateTimeInput(),
    expiry_date: '',
    is_active: true
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
        is_active: coupon.is_active
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
        is_active: true
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#51D3B7]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Manage Offers & Coupons</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#51D3B7] hover:bg-[#3dbfa3] text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm"
        >
          <Plus className="w-5 h-5" /> Add Coupon
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4">Offer Title</th>
                <th className="p-4">Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No coupons found. Click "Add Coupon" to create one.
                  </td>
                </tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-bold text-gray-900">{coupon.title}</td>
                  <td className="p-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-mono text-xs font-bold border border-gray-200">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </td>
                  <td className="p-4 text-xs text-gray-600 space-y-1">
                    <div><span className="font-semibold text-green-600">Start:</span> {new Date(coupon.start_date).toLocaleDateString()}</div>
                    <div><span className="font-semibold text-red-600">Exp:</span> {new Date(coupon.expiry_date).toLocaleDateString()}</div>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const now = Date.now()
                      const start = new Date(coupon.start_date).getTime()
                      const end = new Date(coupon.expiry_date).getTime()
                      if (!coupon.is_active) {
                        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">Inactive</span>
                      }
                      if (now > end) {
                        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">Expired</span>
                      }
                      if (now < start) {
                        return <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600">Scheduled</span>
                      }
                      return <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600">Active</span>
                    })()}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleOpenModal(coupon)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#51D3B7]" /> {editingId ? 'Edit Coupon' : 'New Coupon'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Coupon Code</label>
                <input required type="text" placeholder="e.g. SUMMER40" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900 font-mono uppercase" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Offer Title</label>
                <input required type="text" placeholder="e.g. 40% Discount Offer" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Type</label>
                  <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as 'percentage' | 'fixed'})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Value</label>
                  <input required type="number" min="1" step="0.01" placeholder="e.g. 40" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Start Date</label>
                  <input required type="datetime-local" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Expiry Date</label>
                  <input required type="datetime-local" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#51D3B7] text-gray-900 text-sm" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="isActive" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-[#51D3B7] rounded focus:ring-[#51D3B7]" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Coupon is active and available</label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isProcessing} className="flex-1 px-4 py-2.5 text-white bg-[#51D3B7] hover:bg-[#3dbfa3] rounded-xl font-bold transition-colors disabled:opacity-50">
                  {isProcessing ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete Coupon?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this coupon? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeletingId(null)} 
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors disabled:opacity-50"
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
