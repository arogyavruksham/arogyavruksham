import { NextResponse } from 'next/server'
import { sendProductLaunchEmail } from '@/lib/emailService'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: Request) {
  try {
    const { title, imageUrl, price, description, productId } = await req.json()

    if (!title || !price || !productId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch all users to notify them of the new product
    // Note: In a production app with a dedicated newsletter, you would query `newsletter_subscribers`
    const { data: users, error } = await (supabaseAdmin as any).from('users').select('email')

    if (error || !users) {
      console.error('Failed to fetch users for product launch:', error)
      return NextResponse.json({ error: 'Failed to fetch subscriber list' }, { status: 500 })
    }

    const emails = users.map((u: { email: string }) => u.email).filter(Boolean)

    if (emails.length > 0) {
      // Dispatch emails in background
      sendProductLaunchEmail(emails, title, imageUrl || '', price, description || '', productId)
        .then(success => {
          if (!success) console.error('Failed to dispatch some product launch emails')
        })
    }

    return NextResponse.json({ success: true, count: emails.length })
  } catch (error: any) {
    console.error('Product launch email error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
