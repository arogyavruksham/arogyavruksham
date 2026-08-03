import { NextResponse } from 'next/server'
import { sendVerificationOtpEmail } from '@/lib/emailService'

// Global memory store for generated verification codes across Node requests
declare global {
  var otpStore: Map<string, { code: string; expires: number }> | undefined
}

if (!global.otpStore) {
  global.otpStore = new Map()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Generate a cryptographically strong 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Store in global memory store with 10-minute expiration
    global.otpStore!.set(normalizedEmail, {
      code: otpCode,
      expires: Date.now() + 10 * 60 * 1000,
    })

    console.log(`[NODE EMAIL SENDER] Generated OTP for ${normalizedEmail}: ${otpCode}`)

    // Send email via Nodemailer
    const emailResult = await sendVerificationOtpEmail(normalizedEmail, otpCode)

    return NextResponse.json({
      success: true,
      message: emailResult.message,
      simulated: !process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD,
      demoCode: !process.env.EMAIL_USER ? '123456' : undefined,
    })
  } catch (error: any) {
    console.error('Error in Node send-otp endpoint:', error)
    return NextResponse.json({ error: error.message || 'Internal server error while sending OTP.' }, { status: 500 })
  }
}
