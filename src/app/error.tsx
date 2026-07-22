'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Error caught:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 shadow-sm">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Something went wrong!
      </h1>
      <p className="text-gray-500 font-sans text-sm sm:text-base max-w-md mb-6">
        {error?.message || "We encountered an unexpected issue loading this page. Please try reloading or return to the homepage."}
      </p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A73E8] text-white font-bold text-sm rounded-xl shadow-md hover:bg-[#1557b0] transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          <Home className="w-4 h-4" /> Go Home
        </Link>
      </div>
    </div>
  )
}
