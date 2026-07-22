'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react'

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  
  const [authMode, setAuthMode] = useState<'identifier' | 'phone_otp' | 'email_password' | 'email_otp'>('identifier')
  
  // Form States
  const [identifier, setIdentifier] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  
  // UI States
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }

  const handleSendPhoneOtp = async (customPhone?: string) => {
    setError('')
    setLoading(true)
    setupRecaptcha()
    
    try {
      const targetPhone = customPhone || phone
      const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+91${targetPhone}`
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      if (customPhone) setPhone(customPhone)
      setAuthMode('phone_otp')
      setSuccess('Verification code sent to your phone.')
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to send OTP. Please try again.')
      } else {
        setError('Failed to send OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!confirmationResult) throw new Error('Please request a new OTP.')
      await confirmationResult.confirm(otpCode)
      
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
      
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to sync authentication')
      
      if (data.needsSignup) {
        router.push(`/signup?phone=${encodeURIComponent(formattedPhone)}`)
        return
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      
      if (signInError) throw signInError
      
      const { data: userData } = await supabase.from('users').select('role, full_name').eq('email', data.email).single()
      
      login({
        name: userData?.full_name || data.email.split('@')[0],
        email: data.email,
        phone: formattedPhone,
        role: userData?.role || 'user'
      })
      
      router.push('/')
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Invalid OTP. Please try again.')
      } else {
        setError('Invalid OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        const { data: userData } = await supabase.from('users').select('role, full_name, phone').eq('email', email).single()
        
        login({
          name: userData?.full_name || email.split('@')[0],
          email: email,
          phone: userData?.phone || '',
          role: userData?.role || 'user'
        })
        router.push('/')
      }
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Invalid email or password.')
      } else {
        setError('Invalid email or password.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }
      })

      if (otpError) throw otpError

      setSuccess('Verification code sent to your email!')
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to send OTP to email.')
      } else {
        setError('Failed to send OTP to email.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col justify-between selection:bg-black selection:text-white">
      <div id="recaptcha-container"></div>
      
      {/* Top Header */}
      <header className="p-6 lg:px-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to store</span>
        </Link>
        <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
          Arogyavruksham Silks.
        </Link>
        <div className="w-20" /> {/* Spacer */}
      </header>

      {/* Main Form Container */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          
          <div className="p-8 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#7A1B28] flex items-center justify-center text-white font-bold text-lg mb-6 shadow-sm">
              P
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {authMode === 'identifier' ? 'Log in or sign up' :
               authMode === 'phone_otp' ? 'Enter verification code' :
               authMode === 'email_password' ? 'Welcome back' :
               'Email verification'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {authMode === 'identifier' ? 'Enter your mobile number or email address to continue.' :
               authMode === 'phone_otp' ? `Sent to +91 ${phone}` :
               authMode === 'email_password' ? 'Enter your password to access your account.' :
               'We will email you a login code.'}
            </p>
          </div>

          <div className="p-8 pt-2">
            {error && (
              <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 text-xs text-green-700 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* IDENTIFIER VIEW */}
            {authMode === 'identifier' && (
              <form onSubmit={(e) => {
                e.preventDefault()
                setError('')
                const trimmed = identifier.trim()
                if (!trimmed) return

                if (trimmed.includes('@')) {
                  setEmail(trimmed)
                  setAuthMode('email_password')
                } else {
                  const digits = trimmed.replace(/\D/g, '')
                  if (digits.length < 10) {
                    setError('Please enter a valid 10-digit mobile number or email address.')
                    return
                  }
                  handleSendPhoneOtp(digits.slice(-10))
                }
              }} className="space-y-4">
                <div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                    placeholder="Phone number or email"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-black focus:ring-1 focus:ring-black text-sm transition-all outline-none placeholder:text-gray-400 font-normal bg-white"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !identifier.trim()}
                  className="w-full py-3.5 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* PHONE OTP VIEW */}
            {authMode === 'phone_otp' && (
              <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                <div>
                  <input 
                    type="text" 
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000" 
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-2xl tracking-[0.4em] text-center font-mono font-medium text-gray-900 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <button type="button" onClick={() => setAuthMode('identifier')} className="hover:text-gray-900">
                    Change number
                  </button>
                  <button type="button" onClick={() => handleSendPhoneOtp()} className="text-gray-900 font-medium hover:underline">
                    Resend code
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3.5 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify code'}
                </button>
              </form>
            )}

            {/* EMAIL PASSWORD VIEW */}
            {authMode === 'email_password' && (
              <form onSubmit={handleEmailPasswordSubmit} className="space-y-4">
                <div>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Password" 
                      required
                      className="w-full pl-4 pr-10 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <button
                      type="button"
                      onClick={() => setAuthMode('email_otp')}
                      className="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2"
                    >
                      Sign in with a login code instead
                    </button>
                    <a href="#" className="text-xs text-gray-500 hover:text-gray-900 font-medium">Forgot password?</a>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !password}
                  className="w-full py-3.5 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Continue'}
                </button>


                <button 
                  type="button" 
                  onClick={() => { setAuthMode('identifier'); setError(''); setSuccess(''); }}
                  className="w-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 text-center"
                >
                  Use another option
                </button>
              </form>
            )}

            {/* EMAIL OTP VIEW */}
            {authMode === 'email_otp' && (
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                >
                  {loading ? 'Sending code...' : 'Send login code'}
                </button>

                <button 
                  type="button" 
                  onClick={() => { setAuthMode('identifier'); setError(''); setSuccess(''); }}
                  className="w-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 text-center"
                >
                  Use another option
                </button>
              </form>
            )}

            {/* DIVIDER & GOOGLE */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">or</span>
                <div className="h-px bg-gray-100 flex-1" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

          </div>

          <div className="bg-gray-50/80 py-3 px-6 text-center border-t border-gray-100">
            <p className="text-[11px] text-gray-500">
              New user? <Link href="/signup" className="underline font-medium hover:text-gray-900">Create an account</Link>
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Arogyavruksham Silks. All rights reserved.
      </footer>
    </div>
  )
}
