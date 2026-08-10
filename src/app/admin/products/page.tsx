'use client'

import { useEffect, useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Loader2, X, Upload, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { adminDbProxy } from '@/lib/admin-proxy'
import { useCategories, normalizeProducts, DB_ALLOWED_CATEGORIES } from '@/lib/categories'

export default function AdminProductsPage() {
  const categoriesList = useCategories()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState('')

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
        await adminDbProxy({
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
    if (!searchFilter.trim()) return true;
    return p.title?.toLowerCase().includes(searchFilter.toLowerCase()) || p.category?.toLowerCase().includes(searchFilter.toLowerCase());
  })

  return (
    <div className="space-y-6 relative pb-24 md:pb-8 text-gray-900 font-sans">
      {/* Header Controls - Exact Reference Style with Monochrome Palette */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-sm font-medium text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 shadow-2xs cursor-pointer">
            <Filter className="w-4 h-4 text-gray-600" /> Filter
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-800 text-white rounded-xl text-sm font-bold hover:bg-emerald-900 transition-all w-full sm:w-auto justify-center shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Products Table - Exact Reference Style with Monochrome Palette */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6 font-semibold w-12">
                  <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-emerald-800 cursor-pointer" />
                </th>
                <th className="p-4 font-bold">PRODUCT</th>
                <th className="p-4 font-bold">CATEGORY</th>
                <th className="p-4 font-bold">ORIGINAL PRICE</th>
                <th className="p-4 font-bold">SELLING PRICE</th>
                <th className="p-4 font-bold">STOCK</th>
                <th className="p-4 font-bold">STATUS</th>
                <th className="p-4 pr-6 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto mb-2 text-gray-900" />
                    Loading products...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-gray-400 italic">
                    No products found in catalog.
                  </td>
                </tr>
              ) : filteredProducts.map((product) => {
                const status = product.stock_count > 10 ? 'In Stock' : product.stock_count > 0 ? 'Low Stock' : 'Out of Stock';
                return (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-emerald-800 cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-[10px] bg-gray-100 rounded-lg">N/A</div>
                          )}
                        </div>
                        <div>
                          <p onClick={() => handleEditClick(product)} className="font-bold text-gray-900 group-hover:underline transition-colors cursor-pointer text-sm leading-snug">{product.title}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{product.id.split('-')[0].toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-semibold">{product.category}</td>
                    <td className="p-4 text-gray-400 font-semibold line-through">₹{product.original_price || product.price}</td>
                    <td className="p-4 font-black text-gray-900 text-base">₹{product.price}</td>
                    <td className="p-4 font-bold text-gray-700">{product.stock_count}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${
                        status === 'In Stock' ? 'bg-green-50 text-green-700 border border-green-200/60' : 
                        status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 
                        'bg-red-50 text-red-700 border border-red-200/60'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="hidden md:flex items-center justify-end gap-2.5">
                        <button onClick={() => handleEditClick(product)} title="Edit Product" className="p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(product.id)} title="Delete Product" className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <button onClick={() => handleEditClick(product)} className="text-gray-400 hover:text-gray-600 md:hidden cursor-pointer">
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

      {/* Add / Edit Product Modal - Monochrome & Clean */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-200/80 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-gray-900">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100/80 relative overflow-hidden transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2 mix-blend-multiply" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-700"><span className="font-bold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-400 font-medium">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Product Name</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-semibold text-sm transition-all" placeholder="e.g. Fiddle Leaf Fig Plant" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 font-semibold text-sm cursor-pointer transition-all">
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                    {!categoriesList.some(c => c.name === category) && category && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Actual Price (MRP)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input required type="number" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-bold text-sm transition-all" placeholder="2400" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Original price displayed with strikethrough.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-900 font-black">₹</span>
                    <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-black text-sm transition-all" placeholder="1800" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Actual purchase price for customers.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Cost Price (Business Cost)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                    <input required type="number" min="0" value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-semibold text-sm transition-all" placeholder="1000" />
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">Used for automatic net profit calculation.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Initial Stock Count</label>
                  <input required type="number" min="0" value={stockCount} onChange={e => setStockCount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-bold text-sm transition-all" placeholder="35" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-gray-900 placeholder:text-gray-400 font-medium text-sm transition-all" placeholder="Describe the plant care instructions, sunlight requirements, and features..." />
              </div>

              {error && (
                <div className="p-3.5 text-xs font-bold text-red-600 bg-red-50 rounded-xl border border-red-200">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-between items-center gap-3 border-t border-gray-200/80">
                {editingId ? (
                  <button type="button" onClick={() => { setIsModalOpen(false); handleDeleteClick(editingId); }} className="px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete Product</span>
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-300 transition-colors cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-xs cursor-pointer">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Saving...' : 'Save Product'}
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
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-200"
            >
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-500 text-xs mb-6 font-medium leading-relaxed">Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from your store inventory.</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
