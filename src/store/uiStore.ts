import { create } from 'zustand'

interface UIState {
  isAIOpen: boolean
  setAIOpen: (isOpen: boolean) => void
  toggleAI: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isAIOpen: false,
  setAIOpen: (isOpen) => set({ isAIOpen: isOpen }),
  toggleAI: () => set((state) => ({ isAIOpen: !state.isAIOpen })),
}))
