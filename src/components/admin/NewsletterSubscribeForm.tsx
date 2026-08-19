'use client'

import { FormEvent, useState } from 'react'
import { addLocalSubscriber } from '@/lib/newsletter'
import { supabase } from '@/lib/supabase'

export function NewsletterSubscribeForm({
  compact = false,
  source = 'site',
}: {
  compact?: boolean
  source?: string
}) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'ok' | 'duplicate' | 'error'>('idle')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    const local = addLocalSubscriber(email, source)
    if (!local.ok) {
      setStatus('error')
      return
    }
    try {
      const { error } = await supabase.from('newsletter_subscribers').insert({
        email: email.trim().toLowerCase(),
        source,
      })
      if (error && !error.message?.toLowerCase().includes('duplicate') && error.code !== '23505') {
        console.warn('Newsletter remote save skipped:', error.message)
      }
    } catch (err) {
      console.warn(err)
    }
    setEmail('')
    setStatus(local.duplicate ? 'duplicate' : 'ok')
    setTimeout(() => setStatus('idle'), 3500)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={compact ? 'flex gap-2' : 'flex mb-2'}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email..."
          className={
            compact
              ? 'flex-1 border border-gray-200 rounded-md px-3 py-2 text-[10px] focus:outline-none focus:border-[#1A73E8]'
              : 'flex-1 border border-gray-300 border-r-0 px-4 py-3 text-[13px] focus:outline-none focus:border-black'
          }
        />
        <button
          type="submit"
          disabled={status === 'saving'}
          className={
            compact
              ? 'bg-[#1A73E8] text-white px-4 py-2 rounded-md text-[10px] font-medium hover:bg-blue-700'
              : 'bg-black text-white px-8 py-3 text-[13px] font-bold hover:bg-gray-800'
          }
        >
          {status === 'saving' ? '...' : compact ? 'Subscribe' : 'Sign Up'}
        </button>
      </form>
      {status === 'ok' && <p className="text-xs text-emerald-700 font-semibold mt-1">You’re subscribed. Thank you!</p>}
      {status === 'duplicate' && <p className="text-xs text-emerald-700 font-semibold mt-1">This email is already on the list.</p>}
      {status === 'error' && <p className="text-xs text-red-600 font-semibold mt-1">Please enter a valid email.</p>}
    </div>
  )
}
