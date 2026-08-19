export type StoreSettings = {
  storeName: string
  supportEmail: string
  supportPhone: string
  monthlyTarget: number
  lowStockThreshold: number
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Arogyavruksham',
  supportEmail: 'support@arogyavrukshamsilks.com',
  supportPhone: '+91 98765 43210',
  monthlyTarget: 145000,
  lowStockThreshold: 10,
}

const STORAGE_KEY = 'arogyavruksham_store_settings'

export function getStoreSettings(): StoreSettings {
  if (typeof window === 'undefined') return DEFAULT_STORE_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STORE_SETTINGS
    return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STORE_SETTINGS
  }
}

export function saveStoreSettings(settings: StoreSettings) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  window.dispatchEvent(new Event('store_settings_updated'))
}
