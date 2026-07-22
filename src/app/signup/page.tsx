'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Mail, Lock, Sparkles, ShieldCheck, Award, ArrowRight, CheckCircle2, User, KeyRound } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const login = useAuthStore((state) => state.login)
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'signup' | 'otp_verify'>('signup')
  const [otpCode, setOtpCode] = useState('')
  const [timer, setTimer] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timer > 0 && view === 'otp_verify') {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timer, view])

  const handleSendOtp = async () => {
    setErrorMsg('')
    setSuccessMsg('')
    setLoading(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('A new confirmation code has been sent to your email!')
      setTimer(60)
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')
    
    if (view === 'otp_verify') {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: 'signup'
      })
      if (error) {
        setErrorMsg(error.message)
        setLoading(false)
        return
      }
      if (data.session) {
        const { data: userData } = await supabase.from('users').select('role').eq('email', email).single()
        login({ 
          name: data.user?.user_metadata?.full_name || email.split('@')[0], 
          email,
          role: userData?.role || 'user'
        })
        router.push('/')
      }
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name }
      }
    })
    
    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    } else {
      if (data.session) {
        login({ name, email, role: 'user' })
        router.push('/')
      } else {
        setSuccessMsg('Registration successful! We have sent a confirmation code to your email.')
        setView('otp_verify')
        setTimer(60)
        setLoading(false)
      }
    }
  }

  const handleGoogleLogin = async () => {
    setErrorMsg('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
    if (error) {
      setErrorMsg(error.message)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex bg-[#FDFCFB] text-foreground relative overflow-hidden">
      {/* Ambient background decoration blobs */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#7A1B28]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left side - Visual Luxury Showcase */}
      <div className="hidden lg:flex lg:w-6/12 xl:w-7/12 relative bg-[#1A060A] overflow-hidden p-12 xl:p-16 flex-col justify-between">
        {/* Background Image with Rich Overlay */}
        <div className="absolute inset-0">
          <img
            className="h-full w-full object-cover object-center scale-105 transition-transform duration-1000 hover:scale-100 opacity-60"
            src="https://images.unsplash.com/photo-1583391733958-693b3f29b809?auto=format&fit=crop&q=80"
            alt="Premium Banarasi Plant Weave"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A060A] via-[#1A060A]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#1A060A]/80" />
        </div>

        {/* Top Brand Tag */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C158] text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Join Royal Privilege Club
          </div>
        </div>

        {/* Floating Glassmorphism Cards */}
        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/15 shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-[#1A060A] font-bold shadow-lg">
                ✨
              </div>
              <div>
                <h4 className="text-white font-serif font-bold text-lg leading-tight">Member VIP Benefits</h4>
                <p className="text-[#E5C158] text-xs font-medium">Exclusive access to new collection drops</p>
              </div>
            </div>
            <ul className="text-gray-200 text-sm space-y-2 my-3">
              <li className="flex items-center gap-2">✔ Free insured worldwide shipping on silk orders</li>
              <li className="flex items-center gap-2">✔ Complimentary plant fall & edging styling</li>
              <li className="flex items-center gap-2">✔ Early access to festive handloom exhibitions</li>
            </ul>
            <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex -space-x-2">
                <img className="w-7 h-7 rounded-full border border-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100" alt="Member" />
                <img className="w-7 h-7 rounded-full border border-white object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100" alt="Member" />
                <img className="w-7 h-7 rounded-full border border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100" alt="Member" />
              </div>
              <span className="text-xs text-gray-300 font-medium">Join 20,000+ Plant Connoisseurs</span>
            </div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <div className="relative z-10 grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-9 h-9 rounded-lg bg-[#7A1B28]/80 border border-white/10 flex items-center justify-center text-[#D4AF37]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">100% Buyer Protection</div>
              <div className="text-xs text-gray-400">Hassle-free returns</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white/90">
            <div className="w-9 h-9 rounded-lg bg-[#7A1B28]/80 border border-white/10 flex items-center justify-center text-[#D4AF37]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Authentic Handloom</div>
              <div className="text-xs text-gray-400">Government Silk Mark</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24 z-10">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Back Link */}
          <Link href="/" className="lg:hidden inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to store
          </Link>

          {/* Heading Section */}
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A1B28]/10 text-[#7A1B28] text-xs font-bold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Become a Member
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              {view === 'signup' ? 'Create Your Account' : 'Confirm Your Email'}
            </h1>
            {view === 'signup' && (
              <p className="mt-2 text-sm text-muted-foreground">
                Already have a royal account?{' '}
                <Link href="/login" className="font-semibold text-[#7A1B28] hover:text-[#9B2233] underline decoration-[#D4AF37]/50 underline-offset-4 transition-all">
                  Sign in here
                </Link>
              </p>
            )}
          </div>

          {/* Form Card */}
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/[0.03] border border-border/80 relative backdrop-blur-sm">
            <form onSubmit={handleSignup} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 text-sm text-red-600 bg-red-50/90 rounded-xl border border-red-200/80 flex items-start gap-2.5 animate-fadeIn">
                  <span className="font-bold text-red-500 mt-0.5">⚠</span>
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3.5 text-sm text-green-800 bg-green-50/90 rounded-xl border border-green-200/80 flex items-start gap-2.5 animate-fadeIn font-medium">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              {view === 'signup' && (
                <>
                  {/* Name Input */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Maharani Lakshmi"
                        className="block w-full min-h-[48px] pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-foreground placeholder-gray-400 focus:bg-white focus:border-[#7A1B28] focus:ring-2 focus:ring-[#7A1B28]/20 focus:outline-none transition-all duration-200 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Mail className="w-5 h-5" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        required
                        placeholder="yourname@example.com"
                        className="block w-full min-h-[48px] pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 text-foreground placeholder-gray-400 focus:bg-white focus:border-[#7A1B28] focus:ring-2 focus:ring-[#7A1B28]/20 focus:outline-none transition-all duration-200 sm:text-sm"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <KeyRound className="w-5 h-5" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        className="block w-full min-h-[48px] pl-11 pr-11 rounded-xl border border-gray-200 bg-gray-50/50 text-foreground placeholder-gray-400 focus:bg-white focus:border-[#7A1B28] focus:ring-2 focus:ring-[#7A1B28]/20 focus:outline-none transition-all duration-200 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* OTP Verify Input */}
              {view === 'otp_verify' && (
                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5 text-center">
                    Enter 8-Digit Confirmation Code
                  </label>
                  <div className="mt-1">
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      required
                      placeholder="••••••••"
                      className="block w-full min-h-[54px] appearance-none rounded-xl border-2 border-[#7A1B28]/30 px-3 py-3 placeholder-gray-300 shadow-inner focus:border-[#7A1B28] focus:outline-none focus:ring-4 focus:ring-[#7A1B28]/10 sm:text-xl bg-white tracking-[0.4em] text-center font-mono font-bold text-[#7A1B28]"
                    />
                  </div>
                </div>
              )}

              {view === 'signup' && (
                <div className="text-xs text-gray-500 leading-relaxed pt-1">
                  By creating an account, you agree to Arogyavruksham Silks&apos;{' '}
                  <a href="#" className="underline font-medium text-gray-700">Terms of Service</a> and{' '}
                  <a href="#" className="underline font-medium text-gray-700">Privacy Policy</a>.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-h-[50px] mt-2 rounded-xl bg-gradient-to-r from-[#7A1B28] via-[#9B2233] to-[#7A1B28] bg-[length:200%_auto] hover:bg-right text-white font-semibold text-sm shadow-lg shadow-[#7A1B28]/25 hover:shadow-xl hover:shadow-[#7A1B28]/35 focus:outline-none focus:ring-2 focus:ring-[#7A1B28] focus:ring-offset-2 transition-all duration-500 disabled:opacity-50 flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    <span>{view === 'signup' ? 'Create Royal Account' : 'Verify Account & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OTP Resend / Switcher options */}
            {view === 'otp_verify' && (
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
                {timer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend code in <span className="font-bold text-[#7A1B28] font-mono">{timer}s</span>
                  </p>
                ) : (
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    className="text-sm text-[#7A1B28] font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Resend Confirmation Code
                  </button>
                )}
                <button 
                  onClick={() => { setView('signup'); setErrorMsg(''); setSuccessMsg(''); }} 
                  className="mt-3 text-xs text-gray-500 hover:text-gray-800 transition-colors block mx-auto"
                >
                  ← Back to registration
                </button>
              </div>
            )}

            {/* Social Divider & Google Signup */}
            {view === 'signup' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">Or sign up with</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full min-h-[46px] rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:border-gray-300 transform active:scale-[0.99]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Sign up with Google</span>
                </button>
              </>
            )}
          </div>

          {/* Footer Security Note */}
          <p className="mt-6 text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#046307]" /> 256-bit SSL Encrypted & Secure Protection
          </p>
        </div>
      </div>
    </div>
  )
}

