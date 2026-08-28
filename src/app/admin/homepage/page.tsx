'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, RotateCcw, Image as ImageIcon, AlertTriangle, CheckCircle2, Copy, Upload, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { DEFAULT_IMAGES } from '@/lib/homepageImages'

interface HomepageImage {
  id: string
  image_url: string
  alt_text: string
  updated_at?: string
}

const IMAGE_SECTIONS = [
  {
    section: 'Hero Section Banners',
    description: 'The 4 images in the top hero section (2x2 grid on desktop)',
    keys: ['hero_grid_1', 'hero_grid_4', 'hero_grid_2', 'hero_grid_3'],
    labels: {
      hero_grid_1: 'Top Image (Left Stack)',
      hero_grid_4: 'Bottom Image (Left Stack)',
      hero_grid_2: 'Top Image (Right Stack)',
      hero_grid_3: 'Bottom Image (Right Stack)'
    },
    sizes: {
      default: '1:1 Square'
    },
    aspects: {
      default: 'aspect-square'
    }
  },
  {
    section: 'Category Cards',
    description: '3 category overlay card backgrounds',
    keys: ['category_1', 'category_2', 'category_3'],
    sizes: {
      category_1: '2:1 Landscape',
      category_2: '2:1 Landscape',
      category_3: '1:1 Square',
    },
    aspects: {
      category_1: 'aspect-[2/1]',
      category_2: 'aspect-[2/1]',
      category_3: 'aspect-square',
    }
  },
  {
    section: 'Plant Gallery',
    description: '6 images in the masonry gallery section',
    keys: ['gallery_1', 'gallery_2', 'gallery_3', 'gallery_4', 'gallery_5', 'gallery_6'],
    sizes: {
      default: 'Square / Portrait'
    },
    aspects: {
      default: 'aspect-[4/5]'
    }
  },
  {
    section: 'Blog / Trending Articles',
    description: 'Images for the 3 trending article cards',
    keys: ['blog_1', 'blog_2', 'blog_3'],
    sizes: {
      default: '4:3 Landscape'
    },
    aspects: {
      default: 'aspect-[4/3]'
    }
  },
  {
    section: 'Newsletter Decorations',
    description: 'Small decorative images in the newsletter banner',
    keys: ['newsletter_leaf', 'newsletter_person'],
    sizes: {
      default: 'Transparent PNG'
    },
    aspects: {
      default: 'aspect-[4/3] object-contain'
    }
  },
  {
    section: 'Footer Instagram Grid',
    description: '8 small images in the footer Instagram section',
    keys: ['footer_ig_1', 'footer_ig_2', 'footer_ig_3', 'footer_ig_4', 'footer_ig_5', 'footer_ig_6', 'footer_ig_7', 'footer_ig_8'],
    sizes: {
      default: '1:1 Square'
    },
    aspects: {
      default: 'aspect-square'
    }
  },
]

const SETUP_SQL = `-- Run this in your Supabase SQL Editor to create the homepage_images table:

CREATE TABLE IF NOT EXISTS homepage_images (
  id TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT '',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Allow public read access (images are shown on the public homepage)
ALTER TABLE homepage_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on homepage_images"
  ON homepage_images FOR SELECT
  USING (true);

CREATE POLICY "Allow service role full access on homepage_images"
  ON homepage_images FOR ALL
  USING (true)
  WITH CHECK (true);`

export default function HomepageImagesPage() {
  const { isAdminUnlocked } = useAuthStore()
  const router = useRouter()
  const [images, setImages] = useState<Record<string, HomepageImage>>({})
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [needsSetup, setNeedsSetup] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [loadingAi, setLoadingAi] = useState(false)

  useEffect(() => {
    if (!isAdminUnlocked) {
      router.replace('/admin')
      return
    }
    fetchImages()
  }, [isAdminUnlocked])

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/homepage-images')
      const json = await res.json()
      if (json.needsSetup) {
        setNeedsSetup(true)
      }
      const map: Record<string, HomepageImage> = {}
      const editMap: Record<string, string> = {}
      if (json.data) {
        json.data.forEach((img: HomepageImage) => {
          map[img.id] = img
          editMap[img.id] = img.image_url
        })
      }
      // Fill remaining with defaults
      Object.keys(DEFAULT_IMAGES).forEach((key) => {
        if (!editMap[key]) {
          editMap[key] = DEFAULT_IMAGES[key]
        }
      })
      setImages(map)
      setEditValues(editMap)
    } catch {
      setNeedsSetup(true)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleSave = async (id: string) => {
    setSaving(id)
    setSuccess(null)
    try {
      await fetch('/api/admin/homepage-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, image_url: editValues[id], alt_text: '' }),
      })
      setSuccess(id)
      setTimeout(() => setSuccess(null), 2000)
      fetchImages()
    } catch (err) {
      alert('Failed to save image')
    } finally {
      setSaving(null)
    }
  }

  const handleReset = async (id: string) => {
    try {
      await fetch(`/api/admin/homepage-images?id=${id}`, { method: 'DELETE' })
      setEditValues((prev) => ({ ...prev, [id]: DEFAULT_IMAGES[id] }))
      fetchImages()
    } catch {
      alert('Failed to reset')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    if (!e.target.files || !e.target.files[0]) return
    const file = e.target.files[0]
    setUploadingId(id)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file)

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`)

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName)

      const imageUrl = publicUrlData.publicUrl

      setEditValues(prev => ({ ...prev, [id]: imageUrl }))
      
      // Auto-save after upload
      setSaving(id)
      setSuccess(null)
      await fetch('/api/admin/homepage-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, image_url: imageUrl, alt_text: '' }),
      })
      setSuccess(id)
      setTimeout(() => setSuccess(null), 2000)
      fetchImages()

    } catch (err: any) {
      alert(err.message || 'Failed to upload image')
    } finally {
      setUploadingId(null)
      // Reset input value so same file can be uploaded again if needed
      e.target.value = ''
    }
  }

  const copySql = () => {
    navigator.clipboard.writeText(SETUP_SQL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleGetAiSuggestions = async () => {
    setLoadingAi(true)
    try {
      const password = useAuthStore.getState().adminPassword
      const res = await fetch('/api/admin/banner-suggestions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${password}`
        }
      })
      const data = await res.json()
      if (data.suggestions) {
        setAiSuggestions(data.suggestions)
      } else {
        alert('Failed to get suggestions: ' + (data.error || 'Invalid format'))
      }
    } catch (err) {
      alert('Error fetching AI suggestions.')
    } finally {
      setLoadingAi(false)
    }
  }

  if (!isAdminUnlocked) return null

  return (
    <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#1E4631] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-[28px] font-serif font-bold text-[#1a1a1a]">
                Homepage Images
              </h1>
              <p className="text-sm text-gray-500">
                Manage all editable images on the homepage
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#1E4631] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" /> AI Banner Ideas
              </h2>
              <p className="text-sm text-gray-500 mt-1">Get fresh ideas for today's banners, tailored to the season and upcoming festivals.</p>
            </div>
            <button
              onClick={handleGetAiSuggestions}
              disabled={loadingAi}
              className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0"
            >
              {loadingAi ? (
                 <div className="w-4 h-4 border-2 border-amber-800 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {loadingAi ? 'Generating...' : 'Get Ideas for Today'}
            </button>
          </div>
          
          {aiSuggestions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <h3 className="font-bold text-amber-900 text-sm mb-2">{suggestion.title}</h3>
                  <div className="space-y-2 text-xs text-amber-800">
                    <p><span className="font-semibold">Copy:</span> "{suggestion.copy}"</p>
                    <p><span className="font-semibold">Visual:</span> {suggestion.imageIdea}</p>
                    <p className="mt-2 text-amber-600/80 italic text-[11px] border-t border-amber-200/50 pt-2">Why: {suggestion.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Setup Warning */}
        {needsSetup && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-800 mb-1">
                  Table Setup Required
                </h3>
                <p className="text-sm text-amber-700">
                  The <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">homepage_images</code> table
                  doesn&apos;t exist yet. Run the SQL below in your{' '}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Supabase SQL Editor
                  </a>
                  :
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs overflow-x-auto font-mono leading-relaxed">
                {SETUP_SQL}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
          </div>
        )}

        {/* Image Sections */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#1E4631] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-12">
            {IMAGE_SECTIONS.map((section) => (
              <div key={section.section}>
                <div className="mb-6">
                  <h2 className="text-[20px] font-serif font-bold text-[#1a1a1a]">
                    {section.section}
                  </h2>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.keys.map((key) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Image Preview */}
                      <div className={`w-full ${(section as any).aspects?.[key] || (section as any).aspects?.default || 'aspect-video'} bg-gray-50 flex items-center justify-center relative group`}>
                        {editValues[key] ? (
                          <img
                            src={editValues[key]}
                            alt={key}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        )}
                        {/* Override badge */}
                        {images[key] && (
                          <span className="absolute top-2 right-2 bg-[#1E4631] text-white text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                            Custom
                          </span>
                        )}
                        {/* Uploading overlay */}
                        {uploadingId === key && (
                          <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-10">
                            <div className="w-6 h-6 border-2 border-[#1E4631] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-mono text-gray-800 font-semibold truncate">
                            {(section as any).labels?.[key] || key}
                          </p>
                          {((section as any).sizes?.[key] || (section as any).sizes?.default) && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap ml-2">
                              {(section as any).sizes?.[key] || (section as any).sizes?.default}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={editValues[key] || ''}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                          placeholder="Image URL..."
                          className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 mb-3 focus:outline-none focus:border-[#1E4631] focus:ring-1 focus:ring-[#1E4631]/20 transition-colors font-mono"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSave(key)}
                            disabled={saving === key || uploadingId === key}
                            className="flex-1 bg-[#1E4631] text-white text-xs font-semibold py-2 rounded-lg hover:bg-[#153424] transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {saving === key ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : success === key ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            {success === key ? 'Saved!' : 'Save'}
                          </button>
                          <label className="bg-gray-100 text-gray-600 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50" title="Upload Image">
                            {uploadingId === key ? (
                               <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, key)}
                              disabled={uploadingId === key || saving === key}
                            />
                          </label>
                          {images[key] && (
                            <button
                              onClick={() => handleReset(key)}
                              className="bg-gray-100 text-gray-600 text-xs font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1.5"
                              title="Reset to default"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
