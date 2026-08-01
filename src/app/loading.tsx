import React from 'react'

export default function GlobalLoading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-3 border-[#235839]/20 border-t-[#235839] animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-[#235839]/10 animate-ping"></div>
        </div>
      </div>
      <p className="mt-4 text-xs font-serif font-semibold tracking-wider text-[#235839] uppercase animate-pulse">
        Loading Arogyavruksham...
      </p>
    </div>
  )
}
