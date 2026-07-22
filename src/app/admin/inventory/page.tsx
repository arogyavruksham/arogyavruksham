'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle, PackageX } from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { normalizeProducts } from '@/lib/product-helper'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LOW_STOCK' | 'OUT_OF_STOCK' | 'FULL_STOCK'>('LOW_STOCK')

  useEffect(() => {
    async function fetchInventory() {
      try {
        const { data, error } = await adminDbProxy({
          action: 'select',
          table: 'products',
          order: { column: 'stock_count', ascending: true }
        })
        if (data) setProducts(normalizeProducts(data))
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchInventory()
  }, [])

  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= 10)
  const outOfStock = products.filter(p => p.stock_count === 0)
  const fullStock = products.filter(p => p.stock_count > 10)

  const getActiveList = () => {
    if (activeTab === 'LOW_STOCK') return lowStock
    if (activeTab === 'OUT_OF_STOCK') return outOfStock
    return fullStock
  }

  return (
    <div className="space-y-6">
      
      {/* Header Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('LOW_STOCK')}
          className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'LOW_STOCK' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <AlertTriangle className="w-4 h-4" /> 
          Low Stock ({lowStock.length})
        </button>
        <button 
          onClick={() => setActiveTab('OUT_OF_STOCK')}
          className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'OUT_OF_STOCK' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <PackageX className="w-4 h-4" /> 
          Out of Stock ({outOfStock.length})
        </button>
        <button 
          onClick={() => setActiveTab('FULL_STOCK')}
          className={`pb-4 px-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'FULL_STOCK' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <CheckCircle className="w-4 h-4" /> 
          Full Stock ({fullStock.length})
        </button>
      </div>

      {/* Inventory List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1A73E8]" />
          </div>
        ) : getActiveList().length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-medium">
            No products in this category.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="p-4 font-semibold">Product</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Stock Left</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {getActiveList().map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
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
                          <p className="font-medium text-gray-900">{product.title}</p>
                          <p className="text-xs text-gray-500">{product.id.split('-')[0]}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{product.category}</td>
                    <td className="p-4">
                      <span className={`font-bold text-lg ${product.stock_count === 0 ? 'text-red-600' : product.stock_count <= 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {product.stock_count}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock_count === 0 ? 'bg-red-100 text-red-800' : 
                        product.stock_count <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.stock_count === 0 ? 'Out of Stock' : product.stock_count <= 10 ? 'Low Stock' : 'Full Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
