'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, X, Upload, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { adminDbProxy } from '@/lib/admin-proxy'
import { useCategories, normalizeProducts, DB_ALLOWED_CATEGORIES } from '@/lib/categories'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { getStoreSettings } from '@/lib/store-settings'

export default function AdminProductsPage() {
  const categoriesList = useCategories()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [stockThreshold, setStockThreshold] = useState(10)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [actualPrice, setActualPrice] = useState('')
  const [originalPrice, setOriginalPrice] = useState('')
  const [category, setCategory] = useState('Silk')
  const [stockCount, setStockCount] = useState('10')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await adminDbProxy({
      action: 'select',
      table: 'products',
      order: { column: 'created_at', ascending: false }
    })
    if (!error && data) {
      setProducts(normalizeProducts(data))
    }
    setLoading(false)
  }

  useEffect(() => {
    setStockThreshold(getStoreSettings().lowStockThreshold || 10)
    fetchProducts()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      let imageUrl = ''

      // 1. Upload Image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile)

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
          
        imageUrl = publicUrlData.publicUrl
      }

      // 2. Upsert Product
      const finalCategory = DB_ALLOWED_CATEGORIES.includes(category) ? category : 'Silk'
      const finalDescription = DB_ALLOWED_CATEGORIES.includes(category) ? description : `[CAT:${category}]\n${description || ''}`

      if (editingId) {
        const payload: any = {
          title,
          description: finalDescription,
          price: Number(price),
          actual_price: Number(actualPrice),
          original_price: Number(originalPrice) || Number(price),
          category: finalCategory,
          stock_count: Number(stockCount)
        }
        if (imageUrl) payload.image_url = imageUrl

        await adminDbProxy({
          action: 'update',
          table: 'products',
          data: payload,
          match: { id: editingId }
        })
      } else {
        const insertRes = await adminDbProxy({
          action: 'insert',
          table: 'products',
          data: {
            title,
            description: finalDescription,
            price: Number(price),
            actual_price: Number(actualPrice),
            original_price: Number(originalPrice) || Number(price),
            category: finalCategory,
            stock_count: Number(stockCount),
            image_url: imageUrl || null
          }
        })

        // Trigger Product Launch Email automatically
        try {
          const generatedId = insertRes?.data?.[0]?.id || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          await fetch('/api/email/product-launch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              imageUrl: imageUrl || '',
              price: Number(price),
              description: finalDescription,
              productId: generatedId
            })
          });
        } catch (emailError) {
          console.error('Failed to send product launch emails:', emailError);
        }
      }

      // Success
      setIsModalOpen(false)
      resetForm()
      fetchProducts()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setDescription('')
    setPrice('')
    setActualPrice('')
    setOriginalPrice('')
    setCategory('Silk')
    setStockCount('10')
    setImageFile(null)
    setImagePreview(null)
    setError('')
  }

  const handleEditClick = (product: any) => {
    setEditingId(product.id)
    setTitle(product.title)
    setDescription(product.description || '')
    setPrice(product.price?.toString() || '')
    setActualPrice(product.actual_price?.toString() || '')
    setOriginalPrice(product.original_price?.toString() || product.price?.toString() || '')
    setCategory(product.category)
    setStockCount(product.stock_count?.toString() || '0')
    setImagePreview(product.image_url)
    setImageFile(null)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    setIsDeleting(true)
    try {
      await adminDbProxy({
        action: 'delete',
        table: 'products',
        match: { id: deleteConfirmId }
      })
      fetchProducts()
    } catch (error: any) {
      alert(error.message)
    }
    setIsDeleting(false)
    setDeleteConfirmId(null)
  }

  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchFilter.trim() || p.title?.toLowerCase().includes(searchFilter.toLowerCase()) || p.category?.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6 max-w-full font-sans text-[#111827] pb-28 md:pb-8">
      
      {/* Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-5 border-b border-[#E5E7EB] pb-8">
        <div>
          <h1 className="text-2xl md:text-2xl font-black tracking-tighter text-[#111827] mb-2">Catalog</h1>
          <p className="text-sm md:text-base text-[#6B7280] max-w-[65ch]">
            Manage products, set pricing, and keep stock in sync with inventory.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#059669] text-white shadow-sm border-0 rounded-xl font-bold tracking-tight hover:scale-[0.98] transition-transform shadow-[0_8px_30px_rgba(0,0,0,0.15)] cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={1.5} /> Add Product
        </button>
      </div>

      {/* Top Controls & Filter Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" strokeWidth={1.5} />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search by product name or SKU..." 
              className="w-full pl-9 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-sm font-bold text-[#111827] placeholder-gray-400 transition-all"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl text-sm font-bold text-[#111827] hover:bg-[#059669]/5 shrink-0 cursor-pointer outline-none transition-colors"
          >
            <option value="All">All categories</option>
            {categoriesList.map((cat) => (
              <option key={cat.name} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table - Soft Structuralism */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_8px_40px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[10px] uppercase tracking-widest text-[#9CA3AF] font-bold">
                <th className="p-3 pl-4 font-semibold w-12">
                  <input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] cursor-pointer" />
                </th>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Original Price</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-black/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6B7280]">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#9CA3AF]" strokeWidth={1.5} />
                    <span className="font-bold">Syncing catalog...</span>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#9CA3AF] italic font-bold">
                    No products found in catalog.
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const status = product.stock_count > stockThreshold ? 'In Stock' : product.stock_count > 0 ? 'Low Stock' : 'Out of Stock';
                return (
                  <tr key={product.id} className="hover:bg-[#F3F4F6] transition-colors group">
                    <td className="p-3 pl-4 align-top pt-6">
                      <input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] cursor-pointer" />
                    </td>
                    <td className="p-3 align-top">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white overflow-hidden shrink-0 border border-[#E5E7EB] p-1.5 flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] font-bold text-[10px] bg-[#F9FAFB] rounded-lg">N/A</div>
                          )}
                        </div>
                        <div className="pt-1">
                          <p onClick={() => handleEditClick(product)} className="font-bold text-[#111827] group-hover:underline transition-colors cursor-pointer text-sm leading-snug">{product.title}</p>
                          <p className="text-[11px] font-bold text-[#9CA3AF] font-mono mt-1 uppercase tracking-widest">{product.id.split('-')[0].toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 align-top pt-7 text-[#4B5563] font-bold text-xs">{product.category}</td>
                    <td className="p-3 align-top pt-7 text-[#9CA3AF] font-bold line-through">₹{product.original_price || product.price}</td>
                    <td className="p-3 align-top pt-6 font-black tracking-tight text-[#111827] text-lg">₹{product.price}</td>
                    <td className="p-3 align-top pt-7 font-bold text-[#374151]">{product.stock_count}</td>
                    <td className="p-3 align-top pt-7">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${
                        status === 'In Stock' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                        status === 'Low Stock' ? 'bg-[#059669] text-white shadow-sm border-0' : 
                        'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-3 pr-4 text-right align-top pt-6">
                      <div className="hidden md:flex items-center justify-end gap-3">
                        <button onClick={() => handleEditClick(product)} title="Edit Product" className="p-2.5 text-[#9CA3AF] hover:text-[#059669] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl transition-all cursor-pointer shadow-xs">
                          <Edit className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button onClick={() => handleDeleteClick(product.id)} title="Delete Product" className="p-2.5 text-[#9CA3AF] hover:text-red-600 bg-[#F9FAFB] border border-[#E5E7EB] hover:border-red-100 hover:bg-red-50 rounded-xl transition-all cursor-pointer shadow-xs">
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                      </div>
                      <button onClick={() => handleEditClick(product)} className="text-[#9CA3AF] hover:text-[#4B5563] md:hidden cursor-pointer mt-1">
                        <MoreHorizontal className="w-5 h-5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal - Soft Structuralism */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#059669]/20 backdrop-blur-sm transition-opacity" onClick={() => { setIsModalOpen(false); resetForm(); }} />
          <div className="w-full max-w-xl bg-white h-full shadow-[0_0_60px_rgba(0,0,0,0.1)] flex flex-col relative z-10 animate-in slide-in-from-right duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] border-l border-[#E5E7EB] overflow-y-auto">
            
            <div className="flex items-center justify-between p-5 border-b border-[#E5E7EB] sticky top-0 bg-white/90 backdrop-blur-xl z-20">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF] block mb-1">Catalog Settings</span>
                <h2 className="text-2xl font-black tracking-tighter text-[#111827]">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              </div>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="w-10 h-10 bg-[#F9FAFB] border border-[#E5E7EB] text-[#9CA3AF] hover:text-[#111827] rounded-full flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-5 space-y-5">
              
              {/* Image Upload */}
              <div>
                <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-3">Product Media</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-40 border border-[#D1D5DB] rounded-2xl cursor-pointer bg-[#F9FAFB] hover:bg-[#059669]/5 relative overflow-hidden transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4 mix-blend-multiply" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-[#9CA3AF]" strokeWidth={1.5} />
                        <p className="mb-2 text-sm text-[#111827]"><span className="font-bold">Click to upload</span></p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF]">PNG, JPG, WEBP • Max 5MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Product Name</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] placeholder:text-[#9CA3AF] font-bold text-sm transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]" placeholder="e.g. Fiddle Leaf Fig Plant" />
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] font-bold text-sm cursor-pointer transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                    {!categoriesList.some(c => c.name === category) && category && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Actual Price (MRP)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-bold">₹</span>
                      <input required type="number" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] font-bold text-sm transition-all" placeholder="2400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Selling Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#111827] font-black">₹</span>
                      <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] font-black text-sm transition-all" placeholder="1800" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Cost Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-bold">₹</span>
                      <input required type="number" min="0" value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="w-full pl-7 pr-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] font-bold text-sm transition-all" placeholder="1000" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Stock</label>
                    <input required type="number" min="0" value={stockCount} onChange={e => setStockCount(e.target.value)} className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] font-bold text-sm transition-all" placeholder="35" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:border-[#059669]/20 focus:ring-1 focus:ring-[#059669]/20 outline-none text-[#111827] placeholder:text-[#9CA3AF] font-medium text-sm transition-all resize-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]" placeholder="Write a compelling product description..." />
              </div>

              {error && (
                <div className="p-4 text-xs font-bold text-red-600 bg-red-50 rounded-2xl border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-between items-center gap-4">
                {editingId ? (
                  <button type="button" onClick={() => { setIsModalOpen(false); handleDeleteClick(editingId); }} className="px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-2xl border border-transparent hover:border-red-100 transition-colors flex items-center gap-2 cursor-pointer">
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} /> <span className="hidden sm:inline">Delete</span>
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm font-bold text-[#4B5563] hover:text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] hover:border-[#D1D5DB] rounded-2xl transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-bold text-white bg-[#059669] hover:scale-[0.98] rounded-2xl transition-transform disabled:opacity-50 flex items-center gap-2 shadow-[0_4px_14px_rgba(0,0,0,0.2)] cursor-pointer">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />}
                    {isSubmitting ? 'Saving...' : 'Commit Product'}
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Animated Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#059669]/20 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-5 w-full max-w-sm text-center border border-[#E5E7EB]"
            >
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black tracking-tighter text-[#111827] mb-2">Delete Product</h3>
              <p className="text-[#6B7280] text-sm mb-5 font-medium leading-relaxed">This action cannot be undone and will permanently remove it from your store catalog.</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-4 text-sm font-bold text-[#111827] bg-[#F9FAFB] border border-[#E5E7EB] hover:bg-[#059669]/5 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-4 text-sm font-bold text-white bg-[#059669] hover:scale-[0.98] rounded-2xl transition-transform disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_14px_rgba(0,0,0,0.2)]"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
