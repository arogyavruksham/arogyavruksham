'use client'

import { useState } from 'react'
import { useCategories, saveStoredCategories, CategoryItem } from '@/lib/categories'
import { Plus, Trash2, Sparkles, ExternalLink, Check, Search, Filter } from 'lucide-react'
import Link from 'next/link'

export default function CategoriesPage() {
  const categories = useCategories()
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [image, setImage] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [searchFilter, setSearchFilter] = useState('')

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newSlug = slug.trim() || name.trim()
    const newCat: CategoryItem = {
      name: name.trim(),
      slug: newSlug,
      image: image.trim() || 'https://images.unsplash.com/photo-1610189013233-6e273ffcb638?auto=format&fit=crop&q=80'
    }

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
    setSuccessMsg(`Category "${newCat.name}" added successfully!`)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleDelete = (catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      const updated = categories.filter(c => c.name !== catName)
      saveStoredCategories(updated)
      setSuccessMsg(`Category "${catName}" removed from catalog.`)
      setTimeout(() => setSuccessMsg(''), 4000)
    }
  }

  const filteredCategories = categories.filter(c => {
    if (!searchFilter.trim()) return true;
    return c.name.toLowerCase().includes(searchFilter.toLowerCase()) || (c.slug && c.slug.toLowerCase().includes(searchFilter.toLowerCase()));
  })

  return (
    <div className="space-y-6 text-gray-900 font-sans pb-12">
      
      {/* Top Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 shadow-2xs cursor-pointer">
            <Filter className="w-4 h-4 text-gray-600" /> Filter
          </button>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Close Creator' : 'Add New Category'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-white border border-gray-900 text-gray-900 rounded-2xl shadow-2xs flex items-center gap-3 animate-in fade-in">
          <div className="p-1 bg-gray-900 text-white rounded-full"><Check className="w-3 h-3" /></div>
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Add Form Modal / Inline Box */}
      {isAdding && (
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-xl animate-in slide-in-from-top-4">
          <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-gray-900" /> New Category Specification
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-gray-700 mb-1.5">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ficus Trees"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (!slug) setSlug(e.target.value)
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none font-bold text-gray-900 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-gray-700 mb-1.5">Shop Filter Slug</label>
                <input
                  type="text"
                  placeholder="e.g. Ficus"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none font-bold text-gray-900 text-sm"
                />
                <span className="text-[11px] font-medium text-gray-400 mt-1 block">URL param: /shop?category=...</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-gray-700 mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none font-bold text-gray-900 text-sm"
                />
                <span className="text-[11px] font-medium text-gray-400 mt-1 block">Optional botanic thumbnail</span>
              </div>
            </div>

            {image && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-wider">Thumbnail Preview</p>
                  <p className="text-sm text-gray-900 font-bold">{name || 'Category Name'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" /></th>
                <th className="p-4 font-bold">CATEGORY NAME</th>
                <th className="p-4 font-bold">URL SLUG</th>
                <th className="p-4 font-bold">STORE LINK</th>
                <th className="p-4 pr-6 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-gray-400 italic">
                    No categories found.
                  </td>
                </tr>
              ) : filteredCategories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4 pl-6">
                    <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 p-0.5 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-black text-[11px] bg-gray-200/60 rounded-lg">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                        <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Catalog Entry</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-gray-700 font-bold text-xs">
                    /{cat.slug || cat.name.toLowerCase()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full border border-gray-200 transition-colors"
                    >
                      Open in Store <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleDelete(cat.name)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
