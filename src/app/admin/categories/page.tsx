'use client'

import { useState } from 'react'
import { useCategories, saveStoredCategories, CategoryItem } from '@/lib/categories'
import { Plus, Trash2, ExternalLink, Check, Search } from 'lucide-react'
import Link from 'next/link'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

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
    <div className="space-y-6 text-[#4A3B32] font-sans pb-12">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Categories"
        description="These collections power shop filters and homepage category tiles."
      />
      
      {/* Top Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8ACA3]" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search categories..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EBE3D5] rounded-xl focus:border-[#C25934] focus:ring-1 focus:ring-[#C25934] outline-none text-sm font-semibold text-[#4A3B32] placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-gray-900 transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {isAdding ? 'Close Creator' : 'Add New Category'}
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-white border border-[#C25934] text-[#4A3B32] rounded-2xl shadow-2xs flex items-center gap-3 animate-in fade-in">
          <div className="p-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full"><Check className="w-3 h-3" /></div>
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      {/* Add Form Modal / Inline Box */}
      {isAdding && (
        <div className="bg-white p-6 md:p-5 rounded-2xl border border-[#EBE3D5] shadow-xl animate-in slide-in-from-top-4">
          <h2 className="text-lg font-black text-[#4A3B32] mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#4A3B32]" /> New Category Specification
          </h2>
          <form onSubmit={handleAddCategory} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-[#5C4D43] mb-1.5">Category Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ficus Trees"
                  value={name}
                  onChange={e => {
                    setName(e.target.value)
                    if (!slug) setSlug(e.target.value)
                  }}
                  className="w-full px-4 py-2.5 border border-[#E0D5C1] rounded-xl focus:border-[#C25934] focus:ring-1 focus:ring-[#C25934] outline-none font-bold text-[#4A3B32] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-[#5C4D43] mb-1.5">Shop Filter Slug</label>
                <input
                  type="text"
                  placeholder="e.g. Ficus"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E0D5C1] rounded-xl focus:border-[#C25934] focus:ring-1 focus:ring-[#C25934] outline-none font-bold text-[#4A3B32] text-sm"
                />
                <span className="text-[11px] font-medium text-[#B8ACA3] mt-1 block">URL param: /shop?category=...</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wide text-[#5C4D43] mb-1.5">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#E0D5C1] rounded-xl focus:border-[#C25934] focus:ring-1 focus:ring-[#C25934] outline-none font-bold text-[#4A3B32] text-sm"
                />
                <span className="text-[11px] font-medium text-[#B8ACA3] mt-1 block">Optional botanic thumbnail</span>
              </div>
            </div>

            {image && (
              <div className="flex items-center gap-4 p-4 bg-[#FCF8F5] rounded-xl border border-[#EBE3D5]">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EBE3D5] shadow-2xs">
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#5C4D43] uppercase tracking-wider">Thumbnail Preview</p>
                  <p className="text-sm text-[#4A3B32] font-bold">{name || 'Category Name'}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-5 py-2.5 text-xs font-bold text-[#7A6B61] hover:bg-[#F0EAE1] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#C25934] hover:bg-gray-900 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-2xl border border-[#EBE3D5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-[#FCF8F5] border-b border-[#EBE3D5] text-xs uppercase tracking-wider text-[#96887E] font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-[#E0D5C1] text-[#4A3B32] focus:ring-[#C25934] cursor-pointer" /></th>
                <th className="p-4 font-bold">CATEGORY NAME</th>
                <th className="p-4 font-bold">URL SLUG</th>
                <th className="p-4 font-bold">STORE LINK</th>
                <th className="p-4 pr-6 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#B8ACA3] italic">
                    No categories found.
                  </td>
                </tr>
              ) : filteredCategories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-[#FCF8F5]/80 transition-colors group">
                  <td className="p-4 pl-6">
                    <input type="checkbox" className="rounded border-[#E0D5C1] text-[#4A3B32] focus:ring-[#C25934] cursor-pointer" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-[#FCF8F5] overflow-hidden shrink-0 border border-gray-100 p-0.5 flex items-center justify-center">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#96887E] font-black text-[11px] bg-gray-200/60 rounded-lg">
                            {cat.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-[#4A3B32] text-sm">{cat.name}</p>
                        <span className="text-[11px] text-[#B8ACA3] font-bold uppercase tracking-wider">Catalog Entry</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-[#5C4D43] font-bold text-xs">
                    /{cat.slug || cat.name.toLowerCase()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/shop?category=${encodeURIComponent(cat.slug || cat.name)}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A3B32] bg-[#F0EAE1] hover:bg-gray-200 px-3 py-1 rounded-full border border-[#EBE3D5] transition-colors"
                    >
                      Open in Store <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      onClick={() => handleDelete(cat.name)}
                      className="p-2 text-[#B8ACA3] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
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
