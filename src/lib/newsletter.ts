export type NewsletterSubscriber = {
  id: string
  email: string
  created_at: string
  source: string
}

const STORAGE_KEY = 'arogyavruksham_newsletter_subscribers'

export function getLocalSubscribers(): NewsletterSubscriber[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveLocalSubscribers(list: NewsletterSubscriber[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  window.dispatchEvent(new Event('newsletter_updated'))
}

export function addLocalSubscriber(email: string, source = 'site'): { ok: boolean; duplicate?: boolean; subscriber?: NewsletterSubscriber } {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !trimmed.includes('@')) return { ok: false }
  const existing = getLocalSubscribers()
  if (existing.some((s) => s.email === trimmed)) {
    return { ok: true, duplicate: true }
  }
  const subscriber: NewsletterSubscriber = {
    id: crypto.randomUUID(),
    email: trimmed,
    created_at: new Date().toISOString(),
    source,
  }
  saveLocalSubscribers([subscriber, ...existing])
  return { ok: true, subscriber }
}
