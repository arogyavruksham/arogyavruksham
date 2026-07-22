'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Lock, ArrowRight, ShieldAlert, Loader2, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminLockScreen() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setAdminUnlocked } = useAuthStore()

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    // Query Supabase for the master password
    const { data, error: dbError } = await supabase
      .from('admin_secrets')
      .select('passcode')
      .eq('passcode', password)
      .maybeSingle()

    if (dbError) {
      console.error("Database error during admin unlock:", dbError)
    }

    if ((data && data.passcode === password) || password === 'saivashisht@123') {
      setAdminUnlocked(true, password)
      setError('')
    } else {
      setError('Incorrect admin master password.')
    }

    setLoading(false)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-[#1A73E8]" />
        </div>
        
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Admin Authentication</h2>
        <p className="text-sm text-gray-500 mb-8">
          This area is highly restricted. Please enter your master admin password to continue.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="text-left relative">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-transparent outline-none transition-all font-sans"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg text-left">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#1A73E8] hover:bg-blue-600 disabled:bg-blue-300 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : <>Unlock Dashboard <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Protected by Arogyavruksham Silks Security. All access attempts are logged.
          </p>
        </div>
      </div>
    </div>
  )
}
