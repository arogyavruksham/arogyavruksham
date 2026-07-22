import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  title: string
  price: number
  quantity: number
  imageUrl?: string | null
  stock_count?: number
  category?: string
}

export interface AppliedCoupon {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem, openCart?: boolean) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
  isCheckoutOpen: boolean
  setCheckoutOpen: (isOpen: boolean) => void
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (coupon: AppliedCoupon | null) => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      isCheckoutOpen: false,
      appliedCoupon: null,
      addItem: (item, openCart = true) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          if (existingItem) {
            const newQuantity = existingItem.quantity + item.quantity;
            const limit = existingItem.stock_count || 100;
            if (newQuantity > limit) {
              alert(`Only ${limit} items available in stock.`)
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              ),
              ...(openCart && { isOpen: true }),
            }
          }
          const limit = item.stock_count || 100;
          if (item.quantity > limit) {
            alert(`Only ${limit} items available in stock.`)
            return state;
          }
          return { 
            items: [...state.items, item], 
            ...(openCart && { isOpen: true }) 
          }
        }),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),
      updateQuantity: (id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (item) {
            const limit = item.stock_count || 100;
            if (quantity > limit) {
              alert(`Only ${limit} items available in stock.`)
              return state;
            }
            return {
              items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
            }
          }
          return state;
        }),
      clearCart: () => set({ items: [], appliedCoupon: null }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (isOpen) => set({ isOpen }),
      setCheckoutOpen: (isOpen) => set({ isCheckoutOpen: isOpen }),
      applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
    }),
    {
      name: 'kashvi-cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
