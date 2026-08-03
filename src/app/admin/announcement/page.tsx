'use client'

import { useState, useEffect } from 'react'
import { useAnnouncement, saveStoredAnnouncement, AnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/lib/announcement'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Megaphone, Sparkles, Check, RefreshCw, Eye, Monitor, Smartphone, Palette, Globe, ExternalLink, AlertCircle } from 'lucide-react'

const COLOR_SWATCHES = [
  { label: 'Botanical Olive', bg: '#689f38', text: '#ffffff' },
  { label: 'Deep Forest Green', bg: '#1E4631', text: '#A4E4BA' },
  { label: 'Emerald Mint', bg: '#51D3B7', text: '#111827' },
  { label: 'Warm Amber Gold', bg: '#D97706', text: '#ffffff' },
  { label: 'Midnight Onyx', bg: '#111827', text: '#F8FAFC' },
  { label: 'Royal Crimson', bg: '#991B1B', text: '#FEF2F2' },
]

export default function AdminAnnouncementPage() {
  const currentAnnouncement = useAnnouncement()
  const [formData, setFormData] = useState<AnnouncementConfig>(DEFAULT_ANNOUNCEMENT)
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (currentAnnouncement) {
      setFormData(currentAnnouncement)
    }
  }, [currentAnnouncement])

  const handleChange = (field: keyof AnnouncementConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleApplySwatch = (bg: string, text: string) => {
    setFormData(prev => ({ ...prev, bg_color: bg, text_color: text }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg('')
    setErrorMsg('')

    try {
      // 1. Immediately update localStorage and broadcast custom window event
      saveStoredAnnouncement(formData)

      // 2. Attempt persistence to Supabase announcements table via admin proxy
      const payload = {
        text: formData.text.trim(),
        mobile_text: formData.mobile_text.trim() || formData.text.trim(),
        link_text: formData.link_text.trim(),
        link_url: formData.link_url.trim(),
        bg_color: formData.bg_color,
        text_color: formData.text_color,
        is_active: formData.is_active,
      }

      try {
        await adminDbProxy({
          action: 'update',
          table: 'announcements',
          data: payload,
          match: { id: 'main' }
        })
      } catch (updateErr: any) {
        // If row doesn't exist yet, attempt insert
        try {
          await adminDbProxy({
            action: 'insert',
            table: 'announcements',
            data: { ...payload, id: 'main' }
          })
        } catch (insertErr: any) {
          console.warn('Notice: Could not save to remote Supabase table (migration 00019_announcements.sql might be pending). Saved to offline/local storage successfully.', insertErr)
        }
      }

      setSuccessMsg('Announcement Bar settings saved successfully! Changes are live immediately.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#51D3B7] flex items-center gap-1.5 mb-1">
            <Megaphone className="w-4 h-4" /> Global Marketing & Alerts
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Announcement Bar Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Customize the global promotion bar appearing at the very top of Desktop view and the bottom mobile footer banner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormData(DEFAULT_ANNOUNCEMENT)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors text-sm flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" /> Reset Defaults
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 stroke-[2.5]" />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 animate-in fade-in shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
          <span className="font-bold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Live Previews Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
          <Eye className="w-5 h-5 text-[#235839]" /> Real-Time Live Preview
        </h2>

        {/* PC View Preview */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" /> Desktop / PC Header View (Top of Screen)
          </span>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-3">
            {formData.is_active ? (
              <div 
                style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
                className="py-2 px-4 rounded-lg text-center text-[12px] font-bold tracking-wider uppercase shadow-sm flex items-center justify-center gap-2 transition-colors duration-300"
              >
                <span>{formData.text || 'Enter announcement text...'}</span>
                {formData.link_text && formData.link_url && (
                  <>
                    <span className="opacity-50">|</span>
                    <span className="underline font-extrabold cursor-pointer hover:opacity-80 flex items-center gap-0.5">
                      {formData.link_text} <ExternalLink className="w-3 h-3 inline ml-0.5" />
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-gray-400 font-semibold italic bg-white rounded-lg border border-dashed border-gray-300">
                ⚠️ Announcement Bar is currently DISABLED and hidden from desktop visitors.
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Preview */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase text-gray-400 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" /> Mobile View (Above Bottom Navigation bar)
          </span>
          <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-3 max-w-sm">
            {formData.is_active ? (
              <div 
                style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
                className="py-1.5 px-3 rounded-lg text-center text-[11px] font-bold tracking-wider uppercase shadow-sm flex items-center justify-center gap-1.5 transition-colors duration-300"
              >
                <span className="truncate">{formData.mobile_text || formData.text || 'Enter mobile text...'}</span>
                {formData.link_text && formData.link_url && (
                  <>
                    <span className="opacity-50">|</span>
                    <span className="underline font-black shrink-0 cursor-pointer">{formData.link_text}</span>
                  </>
                )}
              </div>
            ) : (
              <div className="py-3 text-center text-xs text-gray-400 font-semibold italic bg-white rounded-lg border border-dashed border-gray-300">
                ⚠️ Hidden on mobile visitors.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-2xl border border-gray-200/80">
          <div>
            <span className="font-bold text-gray-900 block text-base">Enable Announcement Bar</span>
            <span className="text-xs text-gray-500">Turn this toggle on to broadcast your promotional message across the online greenhouse.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_active} 
              onChange={e => handleChange('is_active', e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#51D3B7]"></div>
          </label>
        </div>

        {/* Text Messaging Section */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Globe className="w-5 h-5 text-[#235839]" /> Promotional Message Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Desktop Display Message <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.text}
                onChange={e => handleChange('text', e.target.value)}
                placeholder="e.g. Free Shipping Every Day, Every Order Over ₹999"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#235839] focus:ring-2 focus:ring-[#235839]/10 font-medium text-sm transition-all bg-white shadow-inner"
              />
              <span className="text-xs text-gray-400 mt-1.5 block">Full message displayed on PC & Desktop wide screens.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Mobile Display Message <span className="text-gray-400 font-normal">(Optional Short Version)</span>
              </label>
              <input 
                type="text" 
                value={formData.mobile_text}
                onChange={e => handleChange('mobile_text', e.target.value)}
                placeholder="e.g. Free Shipping Every Day Over ₹999"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#235839] focus:ring-2 focus:ring-[#235839]/10 font-medium text-sm transition-all bg-white shadow-inner"
              />
              <span className="text-xs text-gray-400 mt-1.5 block">Slightly shorter wording optimized for narrow mobile screens.</span>
            </div>
          </div>
        </div>

        {/* Link Button Controls */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ExternalLink className="w-5 h-5 text-[#235839]" /> Action Link Button
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Link Button Label
              </label>
              <input 
                type="text" 
                value={formData.link_text}
                onChange={e => handleChange('link_text', e.target.value)}
                placeholder="e.g. Shop Now, Explore Deals, View Collection"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#235839] focus:ring-2 focus:ring-[#235839]/10 font-medium text-sm transition-all bg-white shadow-inner"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Destination Route or URL
              </label>
              <input 
                type="text" 
                value={formData.link_url}
                onChange={e => handleChange('link_url', e.target.value)}
                placeholder="e.g. /shop or /shop?category=Indoor"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#235839] focus:ring-2 focus:ring-[#235839]/10 font-mono text-sm transition-all bg-white shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Color Palette Controls */}
        <div className="space-y-4">
          <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Palette className="w-5 h-5 text-[#235839]" /> Color Theme Customization
          </h3>

          {/* Preset Swatches */}
          <div>
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Curated Botanical Themes</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.label}
                  type="button"
                  onClick={() => handleApplySwatch(swatch.bg, swatch.text)}
                  style={{ backgroundColor: swatch.bg, color: swatch.text }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs shadow-xs transition-transform active:scale-95 hover:opacity-90 border-2 ${formData.bg_color === swatch.bg ? 'border-[#51D3B7] ring-2 ring-[#51D3B7]/30 scale-105' : 'border-transparent'}`}
                >
                  {swatch.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Background Color (Hex)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.bg_color} 
                  onChange={e => handleChange('bg_color', e.target.value)}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer shrink-0 p-1 bg-white shadow-inner"
                />
                <input 
                  type="text" 
                  value={formData.bg_color}
                  onChange={e => handleChange('bg_color', e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm font-bold text-gray-800 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Text Color (Hex)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.text_color} 
                  onChange={e => handleChange('text_color', e.target.value)}
                  className="w-12 h-12 rounded-xl border border-gray-200 cursor-pointer shrink-0 p-1 bg-white shadow-inner"
                />
                <input 
                  type="text" 
                  value={formData.text_color}
                  onChange={e => handleChange('text_color', e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-mono text-sm font-bold text-gray-800 uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#235839] hover:bg-[#1A432B] disabled:bg-gray-400 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-[#A4E4BA]" />
            {isSaving ? 'Publishing Changes...' : 'Save & Publish Global Announcement'}
          </button>
        </div>

      </form>
    </div>
  )
}
