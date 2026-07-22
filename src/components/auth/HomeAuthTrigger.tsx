'use client'

import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'

export function HomeAuthTrigger() {
  const { isAuthenticated, setAuthModalOpen } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      // Small delay to allow the hero animation to start
      const timer = setTimeout(() => {
        setAuthModalOpen(true)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [mounted, isAuthenticated, setAuthModalOpen])

  return null
}
