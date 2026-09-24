import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  title: string
  price: number
  imageUrl?: string | null
  category?: string
}

interface WishlistState {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  toggleItem: (item: WishlistItem) => boolean
  isInWishlist: (id: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().items.some((i) => i.id === item.id)) {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      toggleItem: (item) => {
        const exists = get().items.some((i) => i.id === item.id)
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) })
          return false
        } else {
          set({ items: [...get().items, item] })
          return true
        }
      },
      isInWishlist: (id) => get().items.some((i) => i.id === id),
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'arogyavruksham-wishlist-storage',
    }
  )
)
