'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { usePathname, useRouter } from 'next/navigation'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { login, logout, user } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check active session immediately on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const email = session.user.email
        if (email && email !== user?.email) {
          const { data: userData } = await supabase.from('users').select('role').eq('email', email).maybeSingle()
          login({
            name: session.user.user_metadata?.full_name || email.split('@')[0],
            email,
            role: userData?.role || 'user'
          })
        }
      } else if (user) {
        logout()
      }
      
      // If the URL has an access_token (magic link), clear it from the URL to prevent 404/weird routing issues
      if (window.location.hash.includes('access_token')) {
        router.replace('/')
      }
    }
    
    checkSession()

    // Listen for auth changes (like magic links, logins in other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (session?.user) {
          const email = session.user.email
          if (email && email !== useAuthStore.getState().user?.email) {
             const { data: userData } = await supabase.from('users').select('role').eq('email', email).maybeSingle()
             login({
               name: session.user.user_metadata?.full_name || email.split('@')[0],
               email,
               role: userData?.role || 'user'
             })
          }
        }
      } else if (event === 'SIGNED_OUT') {
        if (useAuthStore.getState().isAuthenticated || useAuthStore.getState().user) {
          logout()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, []) // Empty dependency array to run once on mount

  return <>{children}</>
}
