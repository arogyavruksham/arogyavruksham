'use client'

import { useAuthStore } from '@/store/authStore'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { auth } from '@/lib/firebase'
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth'

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

type ViewState = 'identifier' | 'phone' | 'otp' | 'email' | 'success' | 'email_login' | 'email_signup' | 'email_otp' | 'email_otp_verify'

export function AuthModal() {
  const { isAuthModalOpen, setAuthModalOpen, login } = useAuthStore()
  const [view, setView] = useState<ViewState>('identifier')
  
  // Form State
  const [identifier, setIdentifier] = useState('')
  const [phone, setPhone] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  
  // UI State
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [timer, setTimer] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null)

  useEffect(() => {
    if (!isAuthModalOpen) {
      const timeout = setTimeout(() => {
        setView('identifier')
        setIdentifier('')
        setPhone('')
        setOtpCode('')
        setEmail('')
        setName('')
        setPassword('')
        setError('')
        setSuccessMsg('')
        setTimer(0)
        setConfirmationResult(null)
      }, 300)
      return () => clearTimeout(timeout)
    } else {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible'
        })
      }
    }
  }, [isAuthModalOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0 && (view === 'otp' || view === 'email_otp_verify')) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer, view])

  const handleSendOtp = async (e?: React.FormEvent, customPhone?: string) => {
    e?.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      const targetPhone = customPhone || phone
      const formattedPhone = targetPhone.startsWith('+') ? targetPhone : `+91${targetPhone}`
      const appVerifier = window.recaptchaVerifier
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      setConfirmationResult(confirmation)
      if (customPhone) setPhone(customPhone)
      setView('otp')
      setTimer(60)
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

  const handleVerifyOtp = async (e: React.FormEvent) => {
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
        setView('email')
      } else {
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
        setView('success')
        setTimeout(() => setAuthModalOpen(false), 2000)
      }
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
  
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone, email, name, isSignup: true })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete registration')
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      if (signInError) throw signInError
      
      login({ name, email: data.email, phone: formattedPhone, role: 'user' })
      setView('success')
      setTimeout(() => setAuthModalOpen(false), 2000)
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'Failed to register. Please try again.')
      } else {
        setError('Failed to register. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      if (view === 'email_signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role: 'user' } }
        })
        if (signUpError) throw signUpError
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          throw new Error('An account with this email already exists.')
        }
        setSuccessMsg('Registration successful! Please check your email to verify your account.')
        setTimeout(() => setView('email_login'), 3000)
      } else if (view === 'email_login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
        
        const { data: userData } = await supabase.from('users').select('role, full_name, phone').eq('email', email).single()
        login({ 
          name: userData?.full_name || email.split('@')[0], 
          email: email,
          phone: userData?.phone || '',
          role: userData?.role || 'user'
        })
        setView('success')
        setTimeout(() => setAuthModalOpen(false), 2000)
      } else if (view === 'email_otp') {
        const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } })
        if (otpError) throw otpError
        setSuccessMsg('OTP sent to your email!')
        setView('email_otp_verify')
        setTimer(60)
      } else if (view === 'email_otp_verify') {
        const { error: verifyError } = await supabase.auth.verifyOtp({ email, token: otpCode, type: 'email' })
        if (verifyError) throw verifyError
        const { data: userData } = await supabase.from('users').select('role, full_name, phone').eq('email', email).single()
        login({ 
          name: userData?.full_name || email.split('@')[0], 
          email: email,
          phone: userData?.phone || '',
          role: userData?.role || 'user'
        })
        setView('success')
        setTimeout(() => setAuthModalOpen(false), 2000)
      }
    } catch (err: unknown) {
      console.error(err)
      if (err instanceof Error) {
        setError(err.message || 'An error occurred. Please try again.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` }
    })
    if (error) setError(error.message)
  }

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div id="recaptcha-container"></div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAuthModalOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />
          
          {/* MODERN SLEEK COOL POPUP */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl z-10 border border-gray-100 overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-5 right-5 z-20 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="p-7 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#7A1B28] flex items-center justify-center text-white font-bold text-lg mb-5 shadow-sm">
                P
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                {view === 'identifier' ? 'Log in or sign up' :
                 view === 'phone' ? 'Enter phone number' :
                 view === 'otp' ? 'Verify code' :
                 view === 'email' ? 'Complete profile' :
                 view === 'email_login' ? 'Welcome back' :
                 view === 'email_signup' ? 'Create an account' :
                 view === 'email_otp' ? 'Sign in with code' :
                 'Enter verification code'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {view === 'identifier' ? 'Enter your mobile number or email address to continue.' :
                 view === 'phone' ? 'We will send a 6-digit confirmation code.' :
                 view === 'otp' ? `Sent to +91 ${phone}` :
                 view === 'email' ? 'Please set your name and email.' :
                 view === 'email_login' ? 'Enter your password to access your account.' :
                 view === 'email_signup' ? 'Fill in your details below.' :
                 'We will email you a login code.'}
              </p>
            </div>

            {/* Body */}
            <div className="p-7 pt-2 max-h-[75vh] overflow-y-auto">
              {view === 'success' ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Signed in successfully</h3>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                    Redirecting...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 text-xs text-red-600 bg-red-50 rounded-xl border border-red-100 flex items-center gap-2">
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-4 p-3 text-xs text-green-700 bg-green-50 rounded-xl border border-green-100 flex items-center gap-2">
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* IDENTIFIER VIEW */}
                  {view === 'identifier' && (
                    <form onSubmit={(e) => {
                      e.preventDefault()
                      setError('')
                      const trimmed = identifier.trim()
                      if (!trimmed) return

                      if (trimmed.includes('@')) {
                        setEmail(trimmed)
                        setView('email_login')
                      } else {
                        const digits = trimmed.replace(/\D/g, '')
                        if (digits.length < 10) {
                          setError('Please enter a valid 10-digit mobile number or email address.')
                          return
                        }
                        handleSendOtp(undefined, digits.slice(-10))
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

                  {/* PHONE VIEW */}
                  {view === 'phone' && (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="flex rounded-xl border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black overflow-hidden bg-white">
                        <span className="flex items-center px-4 bg-gray-50 text-gray-600 font-medium text-sm border-r border-gray-200 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Mobile number"
                          className="flex-1 w-full px-4 py-3.5 bg-transparent outline-none text-sm font-normal"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading || phone.length < 10}
                        className="w-full py-3.5 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? 'Sending code...' : 'Continue'}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={() => { setView('identifier'); setError(''); setSuccessMsg(''); }}
                        className="w-full text-xs text-gray-500 hover:text-gray-900 py-2 text-center font-medium"
                      >
                        Use another option
                      </button>
                    </form>
                  )}

                  {/* OTP VERIFY VIEW */}
                  {view === 'otp' && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                        <button type="button" onClick={() => setView('identifier')} className="hover:text-gray-900">
                          Change number
                        </button>
                        {timer > 0 ? (
                          <span>Resend in {timer}s</span>
                        ) : (
                          <button type="button" onClick={handleSendOtp} className="text-gray-900 font-medium hover:underline">
                            Resend code
                          </button>
                        )}
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

                  {/* COMPLETE SIGNUP VIEW */}
                  {view === 'email' && (
                    <form onSubmit={handleCompleteSignup} className="space-y-3">
                      <div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Full name" 
                          required
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                        />
                      </div>

                      <div>
                        <input 
                          type="email" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Email address" 
                          required
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                        />
                      </div>

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? 'Creating...' : 'Continue'}
                      </button>
                    </form>
                  )}

                  {/* EMAIL VIEWS */}
                  {(view.startsWith('email_')) && (
                    <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
                      {view === 'email_signup' && (
                        <div>
                          <input 
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Full name" 
                            required
                            className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm"
                          />
                        </div>
                      )}
                      
                      <div>
                        <input 
                          type="email" 
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="Email address" 
                          required
                          disabled={view === 'email_otp_verify'}
                          className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-sm disabled:bg-gray-100"
                        />
                      </div>

                      {(view === 'email_login' || view === 'email_signup') && (
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
                          {view === 'email_login' && (
                            <div className="flex items-center justify-between mt-1.5">
                              <button
                                type="button"
                                onClick={() => setView('email_otp')}
                                className="text-xs font-medium text-gray-600 hover:text-gray-900 underline underline-offset-2"
                              >
                                Sign in with a login code instead
                              </button>
                              <a href="#" className="text-xs text-gray-500 hover:text-gray-900 font-medium">Forgot password?</a>
                            </div>
                          )}
                        </div>
                      )}

                      {view === 'email_otp_verify' && (
                        <div>
                          <input 
                            type="text" 
                            value={otpCode}
                            onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                            placeholder="Code" 
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3.5 focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-xl tracking-[0.3em] text-center font-mono font-medium"
                          />
                        </div>
                      )}

                      <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl bg-[#7A1B28] hover:bg-[#631520] text-white font-medium text-sm transition-all shadow-sm active:scale-[0.99] disabled:opacity-50"
                      >
                        {loading ? 'Please wait...' : (view === 'email_login' ? 'Continue' : view === 'email_signup' ? 'Sign up' : view === 'email_otp' ? 'Send code' : 'Verify code')}
                      </button>
                      
                      <button 
                        type="button" 
                        onClick={() => { setView('identifier'); setError(''); setSuccessMsg(''); }}
                        className="w-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors py-2 text-center"
                      >
                        Use another option
                      </button>
                    </form>
                  )}

                  {(view.startsWith('email_')) && (
                    <div className="pt-2 text-center">

                      <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
                        {view === 'email_login' ? (
                          <>Don&apos;t have an account? <button onClick={() => { setView('email_signup'); setError(''); setSuccessMsg(''); }} className="text-gray-900 font-medium hover:underline ml-1">Sign up</button></>
                        ) : (
                          <>Already have an account? <button onClick={() => { setView('email_login'); setError(''); setSuccessMsg(''); }} className="text-gray-900 font-medium hover:underline ml-1">Log in</button></>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DIVIDER & GOOGLE */}
                  {(view === 'identifier' || view === 'phone' || view.startsWith('email_')) && (
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
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50/80 py-3 px-6 text-center border-t border-gray-100">
              <p className="text-[11px] text-gray-500">
                By continuing, you agree to our <a href="#" className="underline hover:text-gray-900">Terms</a> and <a href="#" className="underline hover:text-gray-900">Privacy Policy</a>.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
