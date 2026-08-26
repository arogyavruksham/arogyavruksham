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

    const dbPhoneVariations = [phone]
    if (!phone.startsWith('+')) {
      dbPhoneVariations.push(`+${phone}`)
    } else {
      dbPhoneVariations.push(phone.substring(1))
    }

    // Check if phone user exists in public.users
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .in('phone', dbPhoneVariations)
      .limit(1)
      .maybeSingle()

    if (existingUser) {
      // Fetch the actual email from auth.users to avoid mismatches
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(existingUser.id)
      const loginEmail = authUser?.user?.email || existingUser.email

      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, { password, phone: dbPhoneVariations.find(p => p.startsWith('+')) || phone })
      return NextResponse.json({ success: true, email: loginEmail, password })
    } else {
      // Phone not found
      if (!name) {
        // Tell frontend we need name to complete signup
        return NextResponse.json({ needsSignup: true })
      }

      // Check if email already exists (only if email was provided)
      if (email) {
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
          
          return NextResponse.json({ success: true, email, phone, password })
        }
      }

      // Create brand new phone-only user (using a synthetic email to bypass Supabase phone restrictions)
      const syntheticEmail = email || `${phone.replace('+', '')}@arogya.auth.com`;
      
      const userData: any = {
        phone,
        password,
        email: syntheticEmail,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { full_name: name }
      };

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser(userData)
      
      if (createError) throw createError
      
      // Update the phone in public.users (since handle_new_user trigger creates the row)
      if (newUser.user) {
        await supabaseAdmin.from('users').update({ phone }).eq('id', newUser.user.id)
      }
      
      return NextResponse.json({ success: true, email: syntheticEmail, phone, password })
    }
  } catch (error: unknown) {
    console.error('Auth Sync Error:', error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'An error occurred during authentication' }, { status: 400 })
    }
    return NextResponse.json({ error: 'An error occurred during authentication' }, { status: 400 })
  }
}
