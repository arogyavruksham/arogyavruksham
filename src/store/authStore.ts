import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'

export interface User {
  name: string
  email: string
  phone?: string
  role?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isAuthModalOpen: boolean
  isAdminUnlocked: boolean
  adminPassword?: string
  login: (user: User) => void
  logout: () => void
  setAuthModalOpen: (isOpen: boolean) => void
  setAdminUnlocked: (isUnlocked: boolean, password?: string) => void
  updateUser: (data: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAuthModalOpen: false,
      isAdminUnlocked: false,
      login: (user) => set({ user, isAuthenticated: true, isAuthModalOpen: false }),
      logout: () => {
        if (get().isAuthenticated || get().user) {
          supabase.auth.signOut()
        }
        set({ user: null, isAuthenticated: false, isAdminUnlocked: false, isAuthModalOpen: true })
      },
      setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
      setAdminUnlocked: (isUnlocked, password) => set({ isAdminUnlocked: isUnlocked, adminPassword: password }),
      updateUser: (data) => set((state) => ({ user: state.user ? { ...state.user, ...data } : null })),
    }),
    {
      name: 'kashvi-auth-storage',
    }
  )
)
