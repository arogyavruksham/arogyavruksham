'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', backgroundColor: '#f9fafb' }}>
          <div style={{ width: '4rem', height: '4rem', backgroundColor: '#fef2f2', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '1.5rem' }}>
            <AlertTriangle style={{ width: '2rem', height: '2rem' }} />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', margin: '0 0 0.5rem 0' }}>
            Application Load Error
          </h1>
          <p style={{ color: '#6b7280', maxWidth: '28rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
            {error?.message || "An unexpected error occurred while loading the root layout. This is usually due to missing environment variables."}
          </p>
          <button
            onClick={() => reset()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', backgroundColor: '#1a73e8', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          >
            <RefreshCw style={{ width: '1rem', height: '1rem' }} /> Try Reloading
          </button>
        </div>
      </body>
    </html>
  )
}
