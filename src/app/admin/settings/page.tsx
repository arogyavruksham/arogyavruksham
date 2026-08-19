'use client'

import { useEffect, useState } from 'react'
import { Check, Lock, Save } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { DEFAULT_STORE_SETTINGS, getStoreSettings, saveStoreSettings, type StoreSettings } from '@/lib/store-settings'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [form, setForm] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS)
  const [saved, setSaved] = useState(false)
  const { user, setAdminUnlocked } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    setForm(getStoreSettings())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveStoreSettings({
      ...form,
      monthlyTarget: Number(form.monthlyTarget) || 0,
      lowStockThreshold: Number(form.lowStockThreshold) || 10,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        eyebrow="System"
        title="Settings"
        description="Store contact details, inventory alerts, and sales targets used across the admin panel."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-5 space-y-6">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#111827] border-b border-gray-100 pb-3">Store profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black uppercase text-[#374151] mb-1.5">Store name</label>
              <input
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#374151] mb-1.5">Support email</label>
              <input
                type="email"
                value={form.supportEmail}
                onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#374151] mb-1.5">Support phone</label>
              <input
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#374151] mb-1.5">Low stock alert</label>
              <input
                type="number"
                min="1"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">Inventory flags items at or below this quantity.</p>
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-[#374151] mb-1.5">Monthly sales target (₹)</label>
              <input
                type="number"
                min="0"
                value={form.monthlyTarget}
                onChange={(e) => setForm({ ...form, monthlyTarget: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-[#D1D5DB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
              />
              <p className="text-[11px] text-[#9CA3AF] mt-1">Used on the Overview sales quota chart.</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {saved ? (
              <span className="text-sm font-bold text-[#059669] flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Settings saved
              </span>
            ) : (
              <span className="text-xs text-[#9CA3AF]">Signed in as {user?.email || 'admin'}</span>
            )}
            <button type="submit" className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-gray-900">
              <Save className="w-4 h-4" /> Save settings
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6">
            <h3 className="font-black text-[#111827] mb-2">Panel security</h3>
            <p className="text-sm text-[#6B7280] mb-4">Lock the admin panel without signing out of the storefront account.</p>
            <button
              onClick={() => {
                setAdminUnlocked(false)
                router.push('/profile')
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold"
            >
              <Lock className="w-4 h-4" /> Lock admin panel
            </button>
          </div>
          <div className="bg-amber-50 text-amber-700 border border-amber-200 rounded-2xl p-6">
            <h3 className="font-black mb-2">Quick reminder</h3>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Categories and announcement drafts also save locally so the storefront updates immediately. Coupons, products, orders, and customers sync through the admin database.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
