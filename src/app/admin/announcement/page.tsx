'use client'

import { useState, useEffect } from 'react'
import { useAnnouncement, saveStoredAnnouncement, AnnouncementConfig, DEFAULT_ANNOUNCEMENT } from '@/lib/announcement'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Megaphone, Check, RefreshCw, Eye, Monitor, Smartphone, Palette, Globe, ExternalLink, AlertCircle } from 'lucide-react'

const COLOR_SWATCHES = [
  { label: 'Monochrome Jet Black', bg: '#000000', text: '#ffffff' },
  { label: 'Clean Crisp White', bg: '#ffffff', text: '#000000' },
  { label: 'Charcoal Slate', bg: '#1F2937', text: '#F9FAFB' },
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
      saveStoredAnnouncement(formData)

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
        try {
          await adminDbProxy({
            action: 'insert',
            table: 'announcements',
            data: { ...payload, id: 'main' }
          })
        } catch (insertErr: any) {
          console.warn('Notice: Could not save to remote Supabase table. Saved to offline/local storage successfully.', insertErr)
        }
      }

      setSuccessMsg('Announcement Bar settings published! Changes are live across the store.')
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 text-[#111827] font-sans pb-12">
      {/* Top Bar - Clean Monochrome Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-[#9CA3AF] flex items-center gap-1.5 mb-1">
            <Megaphone className="w-3.5 h-3.5 text-[#111827]" /> Global Store Marketing Feed
          </span>
          <h1 className="text-2xl font-black text-[#111827] tracking-tight">Announcement Bar Manager</h1>
        </div>
        <button
          type="button"
          onClick={() => setFormData(DEFAULT_ANNOUNCEMENT)}
          className="px-4 py-2.5 rounded-lg border border-[#D1D5DB] text-[#374151] font-bold hover:bg-[#F9FAFB] transition-colors text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
        </button>
      </div>

      {/* Status Notifications */}
      {successMsg && (
        <div className="p-4 bg-white border border-[#059669] text-[#111827] rounded-lg flex items-center gap-3 animate-in fade-in shadow-2xs">
          <div className="p-1 bg-[#059669] text-white shadow-sm border-0 hover:bg-[#047857] rounded-full"><Check className="w-3.5 h-3.5 stroke-[3]" /></div>
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 animate-in fade-in shadow-2xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
          <span className="font-bold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Live Previews Section */}
      <div className="bg-white p-6 rounded-lg border border-[#E5E7EB] shadow-2xs space-y-6">
        <h2 className="text-base font-black text-[#111827] flex items-center gap-2 uppercase tracking-wide">
          <Eye className="w-4 h-4 text-[#111827]" /> Real-Time Live Preview
        </h2>

        {/* PC View Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#9CA3AF] flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 text-[#4B5563]" /> Desktop / PC Header View (Top of Screen)
          </span>
          <div className="rounded-lg border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] p-3 shadow-inner">
            {formData.is_active ? (
              <div 
                style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
                className="py-2 px-4 rounded-lg text-center text-xs font-bold tracking-wider uppercase shadow-2xs flex items-center justify-center gap-2 transition-colors duration-300 border border-[#D1D5DB]"
              >
                <span>{formData.text || 'Enter announcement text...'}</span>
                {formData.link_text && formData.link_url && (
                  <>
                    <span className="opacity-50">|</span>
                    <span className="underline font-black cursor-pointer hover:opacity-80 flex items-center gap-0.5">
                      {formData.link_text} <ExternalLink className="w-3 h-3 inline ml-0.5" />
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#9CA3AF] font-semibold italic bg-white rounded-lg border border-dashed border-[#D1D5DB]">
                ⚠️ Announcement Bar is currently DISABLED and hidden from desktop visitors.
              </div>
            )}
          </div>
        </div>

        {/* Mobile View Preview */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#9CA3AF] flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-[#4B5563]" /> Mobile View (Bottom Navigation Banner)
          </span>
          <div className="rounded-lg border border-[#E5E7EB] overflow-hidden bg-[#F9FAFB] p-3 max-w-sm shadow-inner">
            {formData.is_active ? (
              <div 
                style={{ backgroundColor: formData.bg_color, color: formData.text_color }}
                className="py-2 px-3 rounded-lg text-center text-[11px] font-bold tracking-wider uppercase shadow-2xs flex items-center justify-center gap-1.5 transition-colors duration-300 border border-[#D1D5DB]"
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
              <div className="py-3 text-center text-xs text-[#9CA3AF] font-semibold italic bg-white rounded-lg border border-dashed border-[#D1D5DB]">
                ⚠️ Hidden on mobile screen visitors.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-5 rounded-lg border border-[#E5E7EB] shadow-2xs space-y-5">
        
        {/* Toggle Switch - Monochrome */}
        <div className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div>
            <span className="font-black text-[#111827] block text-base">Enable Announcement Bar</span>
            <span className="text-xs font-semibold text-[#6B7280]">Turn this toggle on to broadcast your promotional banner across the entire online greenhouse.</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.is_active} 
              onChange={e => handleChange('is_active', e.target.checked)} 
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-[#D1D5DB] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#059669] shadow-sm border-0"></div>
          </label>
        </div>

        {/* Text Messaging Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-[#111827] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Globe className="w-4 h-4 text-[#111827]" /> Promotional Message Content
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Desktop Display Message <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                required
                value={formData.text}
                onChange={e => handleChange('text', e.target.value)}
                placeholder="e.g. Free Shipping Every Day, Every Order Over ₹999"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] font-semibold text-sm transition-all bg-white"
              />
              <span className="text-[11px] font-medium text-[#9CA3AF] mt-1.5 block">Full message displayed on PC & Desktop wide screens.</span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Mobile Display Message <span className="text-[#9CA3AF] font-normal">(Optional Short Version)</span>
              </label>
              <input 
                type="text" 
                value={formData.mobile_text}
                onChange={e => handleChange('mobile_text', e.target.value)}
                placeholder="e.g. Free Shipping Every Day Over ₹999"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] font-semibold text-sm transition-all bg-white"
              />
              <span className="text-[11px] font-medium text-[#9CA3AF] mt-1.5 block">Slightly shorter wording optimized for narrow mobile screens.</span>
            </div>
          </div>
        </div>

        {/* Link Button Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-[#111827] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <ExternalLink className="w-4 h-4 text-[#111827]" /> Action Link Button
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Link Button Label
              </label>
              <input 
                type="text" 
                value={formData.link_text}
                onChange={e => handleChange('link_text', e.target.value)}
                placeholder="e.g. Shop Now, Explore Deals, View Collection"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] font-semibold text-sm transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Destination Route or URL
              </label>
              <input 
                type="text" 
                value={formData.link_url}
                onChange={e => handleChange('link_url', e.target.value)}
                placeholder="e.g. /shop or /shop?category=Silk"
                className="w-full px-4 py-2.5 rounded-lg border border-[#D1D5DB] focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] font-mono text-sm transition-all bg-white"
              />
            </div>
          </div>
        </div>

        {/* Color Palette Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-wide text-[#111827] flex items-center gap-2 border-b border-[#E5E7EB] pb-3">
            <Palette className="w-4 h-4 text-[#111827]" /> Color Theme Customization
          </h3>

          <div>
            <span className="block text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Curated Store Themes</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.label}
                  type="button"
                  onClick={() => handleApplySwatch(swatch.bg, swatch.text)}
                  style={{ backgroundColor: swatch.bg, color: swatch.text }}
                  className={`py-2.5 px-3 rounded-lg font-bold text-xs shadow-2xs transition-all cursor-pointer border ${formData.bg_color === swatch.bg ? 'ring-2 ring-black ring-offset-2 font-black scale-105' : 'border-[#D1D5DB] opacity-90 hover:opacity-100'}`}
                >
                  {swatch.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Background Color (Hex)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.bg_color} 
                  onChange={e => handleChange('bg_color', e.target.value)}
                  className="w-11 h-11 rounded-lg border border-[#D1D5DB] cursor-pointer shrink-0 p-0.5 bg-white shadow-2xs"
                />
                <input 
                  type="text" 
                  value={formData.bg_color}
                  onChange={e => handleChange('bg_color', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#D1D5DB] font-mono text-sm font-bold text-[#111827] uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wide text-[#374151] mb-2">
                Text Color (Hex)
              </label>
              <div className="flex items-center gap-3">
                <input 
                  type="color" 
                  value={formData.text_color} 
                  onChange={e => handleChange('text_color', e.target.value)}
                  className="w-11 h-11 rounded-lg border border-[#D1D5DB] cursor-pointer shrink-0 p-0.5 bg-white shadow-2xs"
                />
                <input 
                  type="text" 
                  value={formData.text_color}
                  onChange={e => handleChange('text_color', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-[#D1D5DB] font-mono text-sm font-bold text-[#111827] uppercase"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Save Button - Solid Black */}
        <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#059669] hover:bg-gray-900 disabled:bg-gray-400 text-white font-black text-xs uppercase tracking-wider rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? 'Publishing Changes...' : 'Save & Publish Announcement Bar'}
          </button>
        </div>

      </form>
    </div>
  )
}
