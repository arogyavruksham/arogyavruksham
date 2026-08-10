'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle, PackageX, Search, Filter } from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { normalizeProducts } from '@/lib/product-helper'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LOW_STOCK' | 'OUT_OF_STOCK' | 'FULL_STOCK'>('LOW_STOCK')
  const [searchFilter, setSearchFilter] = useState('')

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
    let list = activeTab === 'LOW_STOCK' ? lowStock : activeTab === 'OUT_OF_STOCK' ? outOfStock : fullStock;
    if (searchFilter.trim()) {
      list = list.filter(p => p.title?.toLowerCase().includes(searchFilter.toLowerCase()) || p.category?.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    return list;
  }

  return (
    <div className="space-y-6 text-gray-900 font-sans">
      
      {/* Top Bar with Search & Filter - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search stock catalog..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Monochrome Header Tabs */}
        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-2xs w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('LOW_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'LOW_STOCK' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <AlertTriangle className="w-4 h-4" /> 
            Low Stock ({lowStock.length})
          </button>
          <button 
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'OUT_OF_STOCK' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <PackageX className="w-4 h-4" /> 
            Out of Stock ({outOfStock.length})
          </button>
          <button 
            onClick={() => setActiveTab('FULL_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'FULL_STOCK' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
          >
            <CheckCircle className="w-4 h-4" /> 
            Full Stock ({fullStock.length})
          </button>
        </div>
      </div>

      {/* Inventory Table - Clean Monochrome Reference Style */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-14 gap-2 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            <span className="text-xs font-bold text-gray-700">Checking inventory logs...</span>
          </div>
        ) : getActiveList().length === 0 ? (
          <div className="p-14 text-center text-gray-400 font-medium italic">
            No products match this inventory threshold.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-emerald-800 cursor-pointer" /></th>
                  <th className="p-4 font-bold">PRODUCT</th>
                  <th className="p-4 font-bold">CATEGORY</th>
                  <th className="p-4 font-bold">STOCK COUNT</th>
                  <th className="p-4 pr-6 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 font-medium">
                {getActiveList().map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors">
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
                          <p className="font-bold text-gray-900 text-sm leading-snug">{product.title}</p>
                          <p className="text-xs text-gray-400 font-mono mt-0.5">{product.id.split('-')[0].toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-semibold">{product.category}</td>
                    <td className="p-4">
                      <span className="font-black text-base text-gray-900">
                        {product.stock_count} units
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${
                        product.stock_count === 0 ? 'bg-red-50 text-red-700 border border-red-200/60' : 
                        product.stock_count <= 10 ? 'bg-amber-50 text-amber-700 border border-amber-200/60' : 
                        'bg-green-50 text-green-700 border border-green-200/60'
                      }`}>
                        {product.stock_count === 0 ? 'Out of Stock' : product.stock_count <= 10 ? 'Low Stock' : 'In Stock'}
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
