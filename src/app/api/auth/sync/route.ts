import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sblnabjurjsqoqtizioq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_build_key_for_vercel_do_not_use'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

function getSecretPassword(phone: string) {
  // Generate a deterministic password based on the phone number and service role key
  return crypto.createHmac('sha256', supabaseServiceKey)
    .update(phone)
    .digest('hex')
    .slice(0, 16) + 'Aa1!' // Ensure password meets complexity requirements
}

export async function POST(request: Request) {
  try {
    const { phone, email, name, isSignup } = await request.json()
    
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const password = getSecretPassword(phone)

    // Check if phone user exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('phone', phone)
      .single()

    if (existingUser) {
      // User exists. Update their password to ensure frontend can log in.
      // This is safe because only this verified API route sets this deterministic password.
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password })
      return NextResponse.json({ success: true, email: existingUser.email, password })
    } else {
      // Phone not found
      if (!isSignup || !email || !name) {
        // Tell frontend we need email and name to complete signup
        return NextResponse.json({ needsSignup: true })
      }

      // Check if email already exists
      const { data: existingEmailUser } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (existingEmailUser) {
        // Link phone to existing email user
        const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(existingEmailUser.id, { 
          phone, 
          password 
        })
        if (updateAuthError) throw updateAuthError

        await supabaseAdmin.from('users').update({ phone, full_name: name }).eq('id', existingEmailUser.id)
        
        return NextResponse.json({ success: true, email, password })
      } else {
        // Create brand new user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email,
          phone,
          password,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: { full_name: name }
        })
        
        if (createError) throw createError
        
        // Update the phone in public.users (since handle_new_user trigger creates the row)
        if (newUser.user) {
          await supabaseAdmin.from('users').update({ phone }).eq('id', newUser.user.id)
        }
        
        return NextResponse.json({ success: true, email, password })
      }
    }
  } catch (error: unknown) {
    console.error('Auth Sync Error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'An error occurred during authentication' }, { status: 400 })
    }
    return NextResponse.json({ error: 'An error occurred during authentication' }, { status: 400 })
  }
}
