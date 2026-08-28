'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertTriangle, CheckCircle, PackageX, Search, Save } from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { normalizeProducts } from '@/lib/product-helper'
import { getStoreSettings } from '@/lib/store-settings'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { supabase } from '@/lib/supabase'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'LOW_STOCK' | 'OUT_OF_STOCK' | 'FULL_STOCK'>('LOW_STOCK')
  const [searchFilter, setSearchFilter] = useState('')
  const [threshold, setThreshold] = useState(10)
  const [draftStock, setDraftStock] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    setThreshold(getStoreSettings().lowStockThreshold || 10)
    async function fetchInventory() {
      try {
        const { data, error } = await adminDbProxy({
          action: 'select',
          table: 'products',
          order: { column: 'stock_count', ascending: true }
        })
        if (data) {
          const list = normalizeProducts(data)
          setProducts(list)
          const drafts: Record<string, string> = {}
          list.forEach((p: any) => { drafts[p.id] = String(p.stock_count ?? 0) })
          setDraftStock(drafts)
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchInventory()

    const channel = supabase.channel(`inventory_changes_admin_${Math.random()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchInventory()
      })
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const lowStock = products.filter(p => p.stock_count > 0 && p.stock_count <= threshold)
  const outOfStock = products.filter(p => p.stock_count === 0)
  const fullStock = products.filter(p => p.stock_count > threshold)

  const saveStock = async (id: string) => {
    const value = Math.max(0, Number(draftStock[id] ?? 0))
    setSavingId(id)
    try {
      await adminDbProxy({
        action: 'update',
        table: 'products',
        data: { stock_count: value },
        match: { id },
      })
      setProducts(products.map((p) => (p.id === id ? { ...p, stock_count: value } : p)))
    } catch (err) {
      console.error(err)
      alert('Could not update stock. Try again.')
    }
    setSavingId(null)
  }

  const getActiveList = () => {
    let list = activeTab === 'LOW_STOCK' ? lowStock : activeTab === 'OUT_OF_STOCK' ? outOfStock : fullStock;
    if (searchFilter.trim()) {
      list = list.filter(p => p.title?.toLowerCase().includes(searchFilter.toLowerCase()) || p.category?.toLowerCase().includes(searchFilter.toLowerCase()));
    }
    return list;
  }

  return (
    <div className="space-y-6 text-[#111827] font-sans">
      <AdminPageHeader
        eyebrow="Commerce"
        title="Inventory"
        description={`Update stock counts in place. Low stock is anything at or below ${threshold} units (change this in Settings).`}
      />
      
      {/* Top Bar with Search & Filter - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search stock catalog..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none text-sm font-semibold text-[#111827] placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Monochrome Header Tabs */}
        <div className="flex bg-white border border-[#E5E7EB] p-1 rounded-xl shadow-2xs w-full sm:w-auto overflow-x-auto">
          <button 
            onClick={() => setActiveTab('LOW_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'LOW_STOCK' ? 'bg-[#059669] text-white shadow-sm border-0 shadow-2xs' : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'}`}
          >
            <AlertTriangle className="w-4 h-4" /> 
            Low Stock ({lowStock.length})
          </button>
          <button 
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'OUT_OF_STOCK' ? 'bg-[#059669] text-white shadow-sm border-0 shadow-2xs' : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'}`}
          >
            <PackageX className="w-4 h-4" /> 
            Out of Stock ({outOfStock.length})
          </button>
          <button 
            onClick={() => setActiveTab('FULL_STOCK')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'FULL_STOCK' ? 'bg-[#059669] text-white shadow-sm border-0 shadow-2xs' : 'text-[#4B5563] hover:text-[#111827] hover:bg-[#F9FAFB]'}`}
          >
            <CheckCircle className="w-4 h-4" /> 
            Full Stock ({fullStock.length})
          </button>
        </div>
      </div>

      {/* Inventory Table - Clean Monochrome Reference Style */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-14 gap-2 text-[#6B7280]">
            <Loader2 className="w-8 h-8 animate-spin text-[#111827]" />
            <span className="text-xs font-bold text-[#374151]">Checking inventory logs...</span>
          </div>
        ) : getActiveList().length === 0 ? (
          <div className="p-14 text-center text-[#9CA3AF] font-medium italic">
            No products match this inventory threshold.
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs uppercase tracking-wider text-[#6B7280] font-bold">
                  <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" /></th>
                  <th className="p-4 font-bold">PRODUCT</th>
                  <th className="p-4 font-bold">CATEGORY</th>
                  <th className="p-4 font-bold">STOCK COUNT</th>
                  <th className="p-4 font-bold">UPDATE</th>
                  <th className="p-4 pr-6 font-bold">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100 font-medium">
                {getActiveList().map(product => (
                  <tr key={product.id} className="hover:bg-[#F9FAFB]/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-[#F9FAFB] overflow-hidden shrink-0 border border-gray-100 p-1 flex items-center justify-center">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-contain mix-blend-multiply" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#9CA3AF] font-bold text-[10px] bg-[#E5E7EB] rounded-lg">N/A</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] text-sm leading-snug">{product.title}</p>
                          <p className="text-xs text-[#9CA3AF] font-mono mt-0.5">{product.id.split('-')[0].toLowerCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#4B5563] font-semibold">{product.category}</td>
                    <td className="p-4">
                      <input
                        type="number"
                        min="0"
                        value={draftStock[product.id] ?? product.stock_count}
                        onChange={(e) => setDraftStock({ ...draftStock, [product.id]: e.target.value })}
                        className="w-24 px-3 py-1.5 border border-[#E5E7EB] rounded-xl font-black text-[#111827] text-sm outline-none focus:border-[#059669]"
                      />
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => saveStock(product.id)}
                        disabled={savingId === product.id || Number(draftStock[product.id]) === Number(product.stock_count)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#059669] text-white shadow-sm border-0 disabled:opacity-40"
                      >
                        {savingId === product.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save
                      </button>
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold ${
                        product.stock_count === 0 ? 'bg-red-50 text-red-700 border border-red-200/60' : 
                        product.stock_count <= threshold ? 'bg-[#059669] text-white shadow-sm border-0/60' : 
                        'bg-green-50 text-green-700 border border-green-200/60'
                      }`}>
                        {product.stock_count === 0 ? 'Out of Stock' : product.stock_count <= threshold ? 'Low Stock' : 'In Stock'}
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
