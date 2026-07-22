'use client'

import { useState } from 'react'
import { useCategories, saveStoredCategories, CategoryItem } from '@/lib/categories'
import { Plus, Trash2, Edit2, Sparkles, Image as ImageIcon, ExternalLink, Check, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function CategoriesPage() {
  const categories = useCategories()
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newSlug = slug.trim() || name.trim()
    const newCat: CategoryItem = {
      name: name.trim(),
      slug: newSlug,
      image: image.trim() || 'https://images.unsplash.com/photo-1610189013233-6e273ffcb638?auto=format&fit=crop&q=80'
    }

    // Check if exists
    const exists = categories.some(c => c.name.toLowerCase() === newCat.name.toLowerCase())
    if (exists) {
      alert('A category with this name already exists.')
      return
    }

    const updated = [...categories, newCat]
    saveStoredCategories(updated)

    setName('')
    setSlug('')
    setImage('')
    setIsAdding(false)
    setSuccessMsg(`Category "${newCat.name}" added successfully and is now visible on Homepage & Products!`)
    setTimeout(() => setSuccessMsg(''), 5000)
  }

  const handleDelete = (catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const updated = categories.filter(c => c.name !== catName)
      saveStoredCategories(updated)
      setSuccessMsg(`Category "${catName}" removed.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#51D3B7] flex items-center gap-1 mb-1">
            <Sparkles className="w-4 h-4" /> Store Catalog Sync
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Categories Manager</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage categories. Added categories immediately appear on the Homepage circles, Navbar subheader, and Product creators.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1A73E8] hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all shrink-0"
        >
          <Plus className="w-5 h-5" /> {isAdding ? 'Close Form' : 'Add New Category'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium text-sm">{successMsg}</span>
        </div>
      )}

      {/* Add Form Modal / Inline Box */}
      {isAdding && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-[#1A73E8]/20 shadow-lg animate-in slide-in-from-top-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#1A73E8]" /> Add New Category
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanjivaram Silk"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (!slug) setSlug(e.target.value)
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none font-medium text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Shop Filter Slug</label>
                <input
                  type="text"
                  placeholder="e.g. Kanjivaram"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none font-medium text-gray-900"
                />
                <span className="text-xs text-gray-400 mt-1 block">Used in URL: /shop?category=...</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1A73E8] outline-none font-medium text-gray-900"
                />
                <span className="text-xs text-gray-400 mt-1 block">Leave blank for default silk cover</span>
              </div>
            </div>

            {image && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow">
                  <img src={image} alt="Preview" className="w-full h-full object-cover object-top" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Thumbnail Preview</p>
                  <p className="text-sm text-gray-600 font-medium">{name || 'Category Name'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#51D3B7] hover:bg-[#43c3a7] text-gray-900 font-extrabold rounded-xl shadow-md transition-all"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-[#51D3B7]/40 shrink-0 relative shadow-inner">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white font-bold text-xs">
                    {cat.name.slice(0, 2)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">{cat.name}</h3>
                <Link
                  href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                  target="_blank"
                  className="text-xs font-medium text-[#1A73E8] hover:underline flex items-center gap-1 mt-0.5"
                >
                  Shop /{cat.slug || cat.name} <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <button
              onClick={() => handleDelete(cat.name)}
              className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete Category"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
