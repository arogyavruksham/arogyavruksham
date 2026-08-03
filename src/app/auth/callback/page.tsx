'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Loader2, CheckCircle2, Sprout } from 'lucide-react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function handleAuthCallback() {
      try {
        // First check if there's an active session from OAuth or Magic Link
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session?.user) {
          const email = session.user.email || ''
          const fullName = session.user.user_metadata?.full_name || email.split('@')[0] || 'Member'
          
          const { data: userData } = await supabase.from('users').select('role, phone').eq('email', email).maybeSingle()

          login({
            name: fullName,
            email: email,
            phone: userData?.phone || '',
            role: userData?.role || 'user'
          })

          setStatus('success')
          setTimeout(() => {
            router.replace('/')
          }, 1200)
          return
        }

        // If no immediate session, check if there is an auth state change in progress
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            const email = session.user.email || ''
            const fullName = session.user.user_metadata?.full_name || email.split('@')[0] || 'Member'
            const { data: userData } = await supabase.from('users').select('role, phone').eq('email', email).maybeSingle()

            login({
              name: fullName,
              email: email,
              phone: userData?.phone || '',
              role: userData?.role || 'user'
            })

            setStatus('success')
            setTimeout(() => {
              router.replace('/')
            }, 1000)
          }
        })

        // Timeout to handle cases where OAuth failed or was cancelled
        const timeout = setTimeout(() => {
          if (status === 'loading' && !useAuthStore.getState().isAuthenticated) {
            setStatus('error')
            setErrorMessage('Authentication session timed out or was cancelled by user.')
          }
        }, 8000)

        return () => {
          subscription.unsubscribe()
          clearTimeout(timeout)
        }
      } catch (err: any) {
        console.error('OAuth Callback Error:', err)
        setStatus('error')
        setErrorMessage(err.message || 'Authentication verification failed.')
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-md w-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#235839] flex items-center justify-center mx-auto mb-6 shadow-xs">
          {status === 'loading' ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#235839]" />
          ) : status === 'success' ? (
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          ) : (
            <Sprout className="w-8 h-8 text-amber-600" />
          )}
        </div>

        <h1 className="font-serif text-2xl font-extrabold text-[#1E4631] mb-3">
          {status === 'loading' && 'Completing Authentication...'}
          {status === 'success' && 'Welcome to Arogyavruksham!'}
          {status === 'error' && 'Authentication Notice'}
        </h1>

        <p className="text-gray-600 text-sm leading-relaxed mb-8">
          {status === 'loading' && 'Please hold while we securely verify your credentials and initialize your botanical workspace.'}
          {status === 'success' && 'Your account has been confirmed. Taking you directly to the home sanctuary...'}
          {status === 'error' && (errorMessage || 'We were unable to verify your sign-in request. Please return to login.')}
        </p>

        {status === 'error' && (
          <button
            onClick={() => router.replace('/login')}
            className="w-full py-3.5 px-6 rounded-xl bg-[#235839] hover:bg-[#1A432B] text-white font-bold text-sm transition-all shadow-sm"
          >
            Return to Login
          </button>
        )}
      </div>
    </div>
  )
}
