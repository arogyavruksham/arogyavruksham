'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'
import { ArrowLeft, Eye, EyeOff, ArrowRight, CheckCircle2, Mail, Lock, User, Phone, KeyRound } from 'lucide-react'
import { motion } from 'framer-motion'

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  
  // Main Navigation Modes & Toggles (defaults to 'login' mode)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [channel, setChannel] = useState<'email' | 'phone'>('email')
  const [otpStep, setOtpStep] = useState<'none' | 'email_otp_verify' | 'phone_otp'>('none')
  
  // Form States
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  
  // UI States
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  const setupRecaptcha = () => {
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      })
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0 && (otpStep === 'email_otp_verify' || otpStep === 'phone_otp')) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer, otpStep])

  // Firebase Phone OTP Sender
  const handleSendPhoneOtp = async (customPhone?: string) => {
    setError('')
    setLoading(true)
    setupRecaptcha()
    try {
      const targetPhone = customPhone || phone
      if (!targetPhone || targetPhone.replace(/\D/g, '').length < 10) {
        throw new Error('Please enter a valid 10-digit mobile number')
      }
      const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+91${targetPhone}`
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      setOtpStep('phone_otp')
      setTimer(60)
      setSuccessMsg('6-digit code sent to your mobile phone!')
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to send phone OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Firebase Phone OTP Verifier
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
        body: JSON.stringify({ phone: formattedPhone, name: name || 'Member', isSignup: mode === 'signup' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete phone authentication')
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      if (signInError) throw signInError
      
      login({ name: name || data.email.split('@')[0] || 'Member', email: data.email, phone: formattedPhone, role: 'user' })
      setSuccessMsg('Verification successful! Taking you to sanctuary...')
      setTimeout(() => router.push('/'), 1200)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Invalid verification code.')
    } finally {
      setLoading(false)
    }
  }

  // Node.js Email OTP Sender
  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address to receive a verification code.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send login code')
      
      setSuccessMsg('Code sent via Node Email Sender! (Check inbox or use demo code: 123456)')
      setOtpStep('email_otp_verify')
      setTimer(60)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Failed to send login code.')
    } finally {
      setLoading(false)
    }
  }

  // Node.js Email OTP Verifier
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Invalid verification code')
      
      login(data.user)
      setSuccessMsg('Verification successful! Taking you to sanctuary...')
      setTimeout(() => router.push('/'), 1200)
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Invalid verification code. Use code 123456 if testing.')
    } finally {
      setLoading(false)
    }
  }

  // Main Form Submit Handler
  const handleMainSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')

    if (channel === 'phone') {
      await handleSendPhoneOtp()
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name || email.split('@')[0], role: 'user' } }
        })
        if (signUpError) throw signUpError
        login({ name: name || email.split('@')[0], email, phone: '', role: 'user' })
        setSuccessMsg('Account created! Taking you to sanctuary...')
        setTimeout(() => router.push('/'), 1200)
      } else {
        if (!password) {
          await handleSendEmailOtp()
          return
        }
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        const { data: userData } = await supabase.from('users').select('role, full_name, phone').eq('email', email).maybeSingle()
        login({ 
          name: userData?.full_name || email.split('@')[0] || 'Member', 
          email: email, 
          phone: userData?.phone || '', 
          role: userData?.role || 'user' 
        })
        setSuccessMsg('Welcome back! Taking you to sanctuary...')
        setTimeout(() => router.push('/'), 1200)
      }
    } catch (err: unknown) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Authentication failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) setError(error.message)
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex flex-col justify-between selection:bg-[#235839] selection:text-white">
      <div id="recaptcha-container"></div>
      
      {/* Top Header Navigation */}
      <header className="p-6 sm:px-12 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-[#235839] transition-colors text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to store</span>
        </Link>
        <Link href="/" className="font-serif font-extrabold text-xl tracking-tight text-[#1E4631] hidden sm:block">
          Arogyavruksham
        </Link>
        <div className="w-24 text-right">
          <Link href="/signup" className="text-xs font-bold text-[#235839] hover:underline">
            Register
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] border border-gray-100 p-6 sm:p-9 relative">
          
          {otpStep === 'email_otp_verify' || otpStep === 'phone_otp' ? (
            /* OTP Verification View */
            <div className="space-y-6 pt-2">
              <div className="text-center">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100/80 shadow-xs">
                  <KeyRound className="w-7 h-7 text-[#235839]" />
                </div>
                <h2 className="font-serif text-2xl font-extrabold text-[#1E4631]">Verify Your Identity</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {otpStep === 'email_otp_verify' ? `We sent a code to ${email}` : `We sent a text to +91 ${phone}`}
                </p>
                {otpStep === 'email_otp_verify' && (
                  <p className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 py-1.5 px-3 rounded-lg mt-3 inline-block border border-emerald-200">
                    Demo test code: <strong>123456</strong>
                  </p>
                )}
              </div>

              {error && (
                <div className="p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={otpStep === 'email_otp_verify' ? handleVerifyEmailOtp : handleVerifyPhoneOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    required
                    className="w-full text-center py-3.5 px-4 text-2xl tracking-[0.4em] font-mono font-bold rounded-2xl border border-gray-300 focus:border-[#235839] focus:ring-1 focus:ring-[#235839] outline-none"
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <button type="button" onClick={() => setOtpStep('none')} className="hover:text-gray-900 font-medium">
                    Back to sign in
                  </button>
                  {timer > 0 ? (
                    <span className="text-gray-400">Resend in {timer}s</span>
                  ) : (
                    <button 
                      type="button" 
                      onClick={otpStep === 'email_otp_verify' ? handleSendEmailOtp : () => handleSendPhoneOtp()} 
                      className="text-[#235839] font-bold hover:underline"
                    >
                      Resend code
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 6}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#1E4631] hover:bg-[#153423] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/15 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            </div>
          ) : (
            /* Main Login / Signup Interface */
            <div>
              {/* Header Section */}
              <div className="mb-7">
                {/* Mobile view Header: Welcome on left */}
                <div className="sm:hidden">
                  <h1 className="font-serif text-3xl font-extrabold tracking-tight text-[#1E4631]">
                    Welcome
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Sign in to your botanical garden sanctuary.
                  </p>
                </div>

                {/* PC view Header: Centered brand and collective */}
                <div className="hidden sm:block text-center">
                  <h1 className="font-serif text-2xl font-extrabold text-[#1E4631] tracking-tight">
                    Arogyavruksham
                  </h1>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1 font-medium">
                    Welcome to the botanical collective.
                  </p>
                </div>
              </div>

              {/* LOGIN | SIGN UP Navigation Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-3 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative ${
                    mode === 'login' ? 'text-[#1E4631]' : 'text-gray-400 hover:text-gray-700 font-semibold'
                  }`}
                >
                  {mode === 'login' ? 'LOGIN' : 'LOG IN'}
                  {mode === 'login' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4631]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-3 text-center text-sm font-extrabold tracking-wider uppercase transition-all relative ${
                    mode === 'signup' ? 'text-[#1E4631]' : 'text-gray-400 hover:text-gray-700 font-semibold'
                  }`}
                >
                  {mode === 'signup' ? 'SIGN UP' : 'SIGN UP'}
                  {mode === 'signup' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1E4631]" />
                  )}
                </button>
              </div>

              {/* EMAIL | PHONE Toggle Pill */}
              <div className="bg-[#F4F6F4] rounded-2xl p-1.5 flex items-center mb-6 border border-gray-200/60">
                <button
                  type="button"
                  onClick={() => { setChannel('email'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-all ${
                    channel === 'email' ? 'bg-white text-[#1E4631] shadow-sm font-black' : 'text-gray-500 hover:text-[#1E4631] font-bold'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => { setChannel('phone'); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wide transition-all ${
                    channel === 'phone' ? 'bg-white text-[#1E4631] shadow-sm font-black' : 'text-gray-500 hover:text-[#1E4631] font-bold'
                  }`}
                >
                  Phone
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2 animate-fadeIn">
                  <span>⚠ {error}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2 animate-fadeIn font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Input Fields Form */}
              <form onSubmit={handleMainSubmit} className="space-y-4">
                {/* FULL NAME (ONLY ON SIGN UP) */}
                {mode === 'signup' && (
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 px-0.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        required={mode === 'signup'}
                        className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-[#235839] focus:ring-1 focus:ring-[#235839] text-sm text-gray-800 placeholder:text-gray-400 bg-white outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* EMAIL CHANNEL */}
                {channel === 'email' ? (
                  <>
                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 px-0.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          placeholder="Enter your email address"
                          required
                          className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-[#235839] focus:ring-1 focus:ring-[#235839] text-sm text-gray-800 placeholder:text-gray-400 bg-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 px-0.5">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required={mode === 'signup'}
                          className="w-full pl-10 pr-10 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-[#235839] focus:ring-1 focus:ring-[#235839] text-sm text-gray-800 placeholder:text-gray-400 bg-white outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* PHONE CHANNEL */
                  <div>
                    <label className="block text-[11px] font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 px-0.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => { setPhone(e.target.value); setError(''); }}
                        placeholder="9346297026"
                        required
                        className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:border-[#235839] focus:ring-1 focus:ring-[#235839] text-sm text-gray-800 placeholder:text-gray-400 bg-white outline-none transition-all font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5 px-0.5">We will text a 6-digit confirmation code to your phone.</p>
                  </div>
                )}

                {/* Remember Me & Forgot / Code Options */}
                <div className="flex items-center justify-between text-xs pt-1 px-0.5 text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-gray-300 text-[#235839] focus:ring-[#235839] w-4 h-4"
                    />
                    <span className="font-medium">Remember me</span>
                  </label>
                  
                  <div className="flex items-center gap-2">
                    {channel === 'email' && mode === 'login' && (
                      <>
                        <button
                          type="button"
                          onClick={handleSendEmailOtp}
                          disabled={loading || !email}
                          className="text-[#235839] font-bold hover:underline disabled:opacity-50"
                        >
                          Use login code
                        </button>
                        <span className="text-gray-300">•</span>
                      </>
                    )}
                    <a 
                      href="#" 
                      onClick={(e) => { e.preventDefault(); alert('Please use "Use login code" to securely authenticate via verified OTP email.'); }}
                      className="font-bold text-gray-700 hover:text-[#235839] transition-colors"
                    >
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#1E4631] hover:bg-[#153423] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-950/15 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'signup' ? 'Create Account' : 'Continue to Sanctuary'}</span>
                      {mode === 'login' && <ArrowRight className="w-4 h-4 ml-0.5" />}
                    </>
                  )}
                </button>
              </form>

              {/* Divider - Or continue with */}
              <div className="my-6 flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Or continue with</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              {/* Social Login: ONLY Google (Apple Removed) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 sm:py-3.5 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-extrabold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs active:scale-[0.99]"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google</span>
              </button>

              {/* Footer terms agreement */}
              <p className="mt-6 text-[11px] sm:text-xs text-gray-400 text-center leading-relaxed">
                By continuing, you agree to our <a href="/terms" className="underline hover:text-gray-600 font-semibold">Terms of Service</a> and <a href="/privacy-policy" className="underline hover:text-gray-600 font-semibold">Privacy Policy</a>.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Arogyavruksham. All rights reserved.
      </footer>
    </div>
  )
}
