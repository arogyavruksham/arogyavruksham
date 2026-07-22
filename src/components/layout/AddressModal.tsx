'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, MapPin, Trash2 } from 'lucide-react'

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddressModal({ isOpen, onClose }: AddressModalProps) {
  const { isAuthenticated, setAuthModalOpen } = useAuthStore()
  const [step, setStep] = useState<'SELECT' | 'ADD'>('SELECT')
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const [newAddress, setNewAddress] = useState({
    name: '',
    email: '',
    phone: '',
    pincode: '',
    state: '',
    city: '',
    fullAddress: ''
  })

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAddresses()
    } else if (isOpen && !isAuthenticated) {
      onClose()
      setAuthModalOpen(true)
    }
  }, [isOpen, isAuthenticated])

  const fetchAddresses = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setAddresses(data || [])
      if (data && data.length === 0) setStep('ADD')
      else setStep('SELECT')
    }
    setLoading(false)
  }

  const handleSelectAddress = async (id: string) => {
    setIsProcessing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Set all to false
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id)
    // Set selected to true
    await supabase.from('user_addresses').update({ is_default: true }).eq('id', id)
    
    window.dispatchEvent(new Event('addressUpdated'))
    setIsProcessing(false)
    onClose()
  }

  const handleSaveAddress = async () => {
    setIsProcessing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Set all to false first
    await supabase.from('user_addresses').update({ is_default: false }).eq('user_id', user.id)

    const { error } = await supabase.from('user_addresses').insert({
      user_id: user.id,
      ...newAddress,
      is_default: true
    })

    if (!error) {
      window.dispatchEvent(new Event('addressUpdated'))
      setNewAddress({ name: '', email: '', phone: '', pincode: '', state: '', city: '', fullAddress: '' })
      onClose()
    } else {
      alert('Failed to save address')
    }
    setIsProcessing(false)
  }

  const handleDeleteAddress = async (e: React.MouseEvent, id: string, isDefault: boolean) => {
    e.stopPropagation()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('user_addresses').delete().eq('id', id).eq('user_id', user.id)
    
    if (isDefault) {
      const remaining = addresses.filter(a => a.id !== id)
      if (remaining.length > 0) {
        await supabase.from('user_addresses').update({ is_default: true }).eq('id', remaining[0].id)
      }
    }
    
    fetchAddresses()
    window.dispatchEvent(new Event('addressUpdated'))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-gray-900">
              {step === 'SELECT' ? 'Choose Delivery Location' : 'Add New Address'}
            </h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 overflow-y-auto flex-1">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading addresses...</div>
            ) : step === 'SELECT' ? (
              <div className="space-y-4">
                {addresses.map(addr => (
                  <div 
                    key={addr.id} 
                    onClick={() => handleSelectAddress(addr.id)}
                    className={`p-4 border rounded-xl cursor-pointer transition-colors relative group ${addr.is_default ? 'border-[#1A73E8] bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <button 
                      onClick={(e) => handleDeleteAddress(e, addr.id, addr.is_default)}
                      className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-3">
                      <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${addr.is_default ? 'text-[#1A73E8]' : 'text-gray-400'}`} />
                      <div className="pr-8">
                        <p className="font-bold text-gray-900 mb-1">{addr.name} {addr.is_default && <span className="ml-2 text-[10px] bg-[#1A73E8] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Default</span>}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {addr.fullAddress}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Ph: {addr.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => setStep('ADD')}
                  className="w-full py-3 flex items-center justify-center gap-2 text-[#1A73E8] font-bold text-sm border-2 border-dashed border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add New Address
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input type="text" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8]" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Phone</label>
                    <input type="tel" maxLength={10} inputMode="numeric" value={newAddress.phone} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (val.length <= 10) setNewAddress({...newAddress, phone: val})
                    }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Pin Code</label>
                    <input type="text" maxLength={5} inputMode="numeric" value={newAddress.pincode} onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      if (val.length <= 5) setNewAddress({...newAddress, pincode: val})
                    }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8]" />
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">State</label>
                    <input type="text" value={newAddress.state} onChange={e => setNewAddress({...newAddress, state: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City</label>
                    <input type="text" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Address</label>
                  <textarea value={newAddress.fullAddress} onChange={e => setNewAddress({...newAddress, fullAddress: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:border-[#1A73E8] resize-none h-20" />
                </div>
                <div className="flex gap-3 pt-4">
                  {addresses.length > 0 && (
                    <button onClick={() => setStep('SELECT')} className="flex-1 py-2.5 text-gray-600 font-bold border border-gray-200 rounded-lg hover:bg-gray-50">Back</button>
                  )}
                  <button 
                    onClick={handleSaveAddress}
                    disabled={isProcessing || !newAddress.name || !newAddress.phone || !newAddress.fullAddress}
                    className="flex-1 py-2.5 bg-[#1A73E8] text-white font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isProcessing ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
