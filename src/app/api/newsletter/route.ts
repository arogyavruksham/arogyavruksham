import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const trimmedEmail = email.trim().toLowerCase()

    const { error } = await (supabaseAdmin as any)
      .from('newsletter_subscribers')
      .insert([{ email: trimmedEmail, source: 'site' }])

    if (error) {
      // 23505 is the PostgreSQL error code for unique violation
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already subscribed!' })
      }
      console.error('[Newsletter] Insert error:', error)
      return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
  } catch (err: any) {
    console.error('[Newsletter] Catch error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
