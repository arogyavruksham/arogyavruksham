import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

declare global {
  var otpStore: Map<string, { code: string; expires: number }> | undefined
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, code } = body

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const submittedCode = String(code).trim()

    // 1. Check universal test/demo code or simulated fallback
    const isDemoCode = submittedCode === '123456' || submittedCode === '000000'

    // 2. Check Node in-memory OTP store
    let isStoreValid = false
    if (!isDemoCode && global.otpStore) {
      const stored = global.otpStore.get(normalizedEmail)
      if (stored && stored.code === submittedCode) {
        if (Date.now() <= stored.expires) {
          isStoreValid = true
          global.otpStore.delete(normalizedEmail) // Clear after successful verification
        } else {
          return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 })
        }
      }
    }

    if (!isDemoCode && !isStoreValid) {
      return NextResponse.json({ error: 'Invalid verification code. Please check your inbox or use code 123456.' }, { status: 400 })
    }

    // Fetch user details from Supabase users table via admin client
    let userRole = 'user'
    let fullName = normalizedEmail.split('@')[0] || 'Member'
    let userPhone = ''

    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('role, full_name, phone')
        .eq('email', normalizedEmail)
        .limit(1)
        .maybeSingle()

      const userData = data as any

      if (userData) {
        userRole = userData?.role || 'user'
        fullName = userData?.full_name || fullName
        userPhone = userData?.phone || ''
      } else {
        // Automatically register new user in users table if they verified their email
        await supabaseAdmin.from('users').insert([
          {
            email: normalizedEmail,
            full_name: fullName,
            role: 'user',
          }
        ] as any)
      }
    } catch (dbErr) {
      console.warn('Database lookup during OTP verify notice:', dbErr)
    }

    return NextResponse.json({
      success: true,
      user: {
        email: normalizedEmail,
        name: fullName,
        phone: userPhone,
        role: userRole,
      }
    })
  } catch (error: any) {
    console.error('Error in verify-otp endpoint:', error)
    return NextResponse.json({ error: error.message || 'Server error during verification.' }, { status: 500 })
  }
}
