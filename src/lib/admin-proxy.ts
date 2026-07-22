import { useAuthStore } from '@/store/authStore'

interface ProxyQueryOptions {
  action: 'select' | 'insert' | 'update' | 'delete'
  table: string
  data?: any
  match?: Record<string, any>
  select?: string
  order?: { column: string; ascending: boolean }
}

export async function adminDbProxy(options: ProxyQueryOptions) {
  const { adminPassword } = useAuthStore.getState()
  
  if (!adminPassword) {
    throw new Error('Admin password is required to access the database.')
  }

  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminPassword}`
    },
    body: JSON.stringify(options)
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`DB Proxy Error: ${res.status} ${errText}`)
  }

  const json = await res.json()
  if (json.error) {
    throw new Error(json.error)
  }

  return { data: json.data, error: null }
}
