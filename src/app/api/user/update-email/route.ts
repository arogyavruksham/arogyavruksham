import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_build_key_for_vercel_do_not_use'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Authenticate the user making the request
    const authHeader = request.headers.get('Authorization')
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
      if (user) userId = user.id
    } else {
       // fallback to cookie session
       const { data: { session } } = await supabaseClient.auth.getSession()
       if (session?.user) userId = session.user.id
    }

    if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update auth.users email (this uses service role to bypass email confirmation requirement if any)
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, { 
      email,
      email_confirm: true
    })
    
    if (updateAuthError) {
      console.error('Error updating auth.users email:', updateAuthError)
    }

    // Update public.users
    const { error: updatePublicError } = await supabaseAdmin
      .from('users')
      .update({ email })
      .eq('id', userId)

    if (updatePublicError) {
      console.error('Error updating public.users email:', updatePublicError)
    }

    return NextResponse.json({ success: true, email })
  } catch (error: unknown) {
    console.error('Update Email Error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'An error occurred' }, { status: 400 })
    }
    return NextResponse.json({ error: 'An error occurred' }, { status: 400 })
  }
}
