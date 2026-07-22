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
        
        const { error: uploadError, data } = await supabase.storage
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

  return (
    <div className="space-y-6 relative pb-24 md:pb-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0">
            <Filter className="w-4 h-4" /> Filter
          </button>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A73E8] text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors w-full sm:w-auto justify-center shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></th>
                <th className="p-4 font-semibold">Product</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Original Price</th>
                <th className="p-4 font-semibold">Selling Price</th>
                <th className="p-4 font-semibold">Stock</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              ) : products.map((product) => {
                const status = product.stock_count > 10 ? 'In Stock' : product.stock_count > 0 ? 'Low Stock' : 'Out of Stock';
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs bg-gray-200">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-[#1A73E8] transition-colors cursor-pointer">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4 text-gray-500 line-through">₹{product.original_price || product.price}</td>
                    <td className="p-4 font-medium text-gray-900">₹{product.price}</td>
                    <td className="p-4 text-gray-600">{product.stock_count}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status === 'In Stock' ? 'bg-green-100 text-green-800' : 
                        status === 'Low Stock' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="hidden md:flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(product)} className="p-1 text-gray-400 hover:text-[#1A73E8] transition-colors"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteClick(product.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <button onClick={() => handleEditClick(product)} className="text-gray-400 hover:text-gray-600 md:group-hover:hidden cursor-pointer"><MoreHorizontal className="w-5 h-5 ml-auto" /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-6">
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 relative overflow-hidden">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="e.g. Royal Blue Silk Plant" />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select required value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 font-medium">
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat.name}>{cat.name}</option>
                    ))}
                    {!categoriesList.some(c => c.name === category) && category && (
                      <option value={category}>{category}</option>
                    )}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Actual Price (MRP)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input required type="number" min="0" value={originalPrice} onChange={e => setOriginalPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="3000" />
                  </div>
                  <p className="text-xs text-gray-500">The original maximum retail price (will be crossed out).</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Selling / Discount Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input required type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="2500" />
                  </div>
                  <p className="text-xs text-gray-500">The discounted amount the customer pays.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cost Price (Business Cost)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input required type="number" min="0" value={actualPrice} onChange={e => setActualPrice(e.target.value)} className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="1500" />
                  </div>
                  <p className="text-xs text-gray-500">The amount it costs you to source this.</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Initial Stock</label>
                  <input required type="number" min="0" value={stockCount} onChange={e => setStockCount(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] outline-none text-gray-900 placeholder:text-gray-400 font-medium" placeholder="Tell customers about this plant..." />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <div className="pt-4 flex justify-between items-center gap-3 border-t border-gray-100">
                {editingId ? (
                  <button type="button" onClick={() => { setIsModalOpen(false); handleDeleteClick(editingId); }} className="px-5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
                  </button>
                ) : <div></div>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-5 py-2 text-sm font-medium text-white bg-[#1A73E8] hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
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
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDeleteConfirmId(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center border border-gray-100"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-100">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this product? This action cannot be undone and will permanently remove it from your store.</p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-red-500/30"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}

