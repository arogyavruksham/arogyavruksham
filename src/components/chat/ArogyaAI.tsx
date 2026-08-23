'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, ArrowUp, Leaf, Sparkles } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

/* ── Motion tokens (Emil / Apple design skills) ── */
const EASE_OUT = [0.23, 1, 0.32, 1] as const        // strong ease-out for UI
const EASE_DRAWER = [0.32, 0.72, 0, 1] as const      // iOS-like drawer curve
const DRAWER_DURATION = 0.38                           // 200–500ms for drawers

export function ArogyaAI() {
  const pathname = usePathname()
  const { isAIOpen, setAIOpen } = useUIStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const [input, setInput] = useState('')
  const user = useAuthStore((s) => s.user)
  const { messages, sendMessage, status, error } = useChat({
    messages: [
      {
        id: 'welcome',
        role: 'assistant',
        parts: [{ type: 'text', text: 'Hello! I\'m your Arogyavruksham plant expert. Ask me anything — plant care, order tracking, recommendations, or troubleshooting.' }],
      },
    ] as any,
  })

  const isAnalyzing = status === 'submitted'
  const isStreaming = status === 'streaming'
  const isLoading = isAnalyzing || isStreaming

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setAIOpen(!isAIOpen)
      }
      if (e.key === 'Escape' && isAIOpen) setAIOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isAIOpen, setAIOpen])

  /* ── Auto-focus on open ── */
  useEffect(() => {
    if (isAIOpen) setTimeout(() => inputRef.current?.focus(), 80)
  }, [isAIOpen])

  /* ── Scroll to bottom ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, status])

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    const id = user?.email
      ? `useremail_${encodeURIComponent(user.email)}_${Date.now()}`
      : `msg_${Date.now()}`
    sendMessage({ id, role: 'user', parts: [{ type: 'text', text: input.trim() }] } as any)
    setInput('')
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <>
      {/* ── Mobile Floating Button ── */}
      <AnimatePresence>
        {!isAIOpen && (pathname === '/' || pathname?.startsWith('/shop')) && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.25, ease: EASE_OUT as any }}
            onClick={() => setAIOpen(true)}
            className="md:hidden fixed bottom-24 left-5 z-[90] flex items-center justify-center w-[52px] h-[52px] bg-gradient-to-br from-[#11311F] to-[#235839] text-white rounded-[18px] shadow-[0_8px_20px_rgba(35,88,57,0.35)] border border-[#2D6A4F] active:scale-95 transition-all group"
            aria-label="Open Arogya AI"
          >
            <Sparkles className="w-6 h-6 text-[#A4E4BA] group-hover:rotate-12 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAIOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* ── Scrim ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE_OUT as any }}
            onClick={() => setAIOpen(false)}
            className="absolute inset-0 bg-black/15"
          />

          {/* ── Drawer ── */}
          <motion.div
            initial={{ transform: 'translateX(100%)' }}
            animate={{ transform: 'translateX(0%)' }}
            exit={{ transform: 'translateX(100%)' }}
            transition={{ duration: DRAWER_DURATION, ease: EASE_DRAWER as any }}
            className="relative w-full sm:w-[420px] md:w-[460px] h-[100dvh] flex flex-col overflow-hidden bg-white"
            style={{
              boxShadow: '-24px 0 48px -12px rgba(0,0,0,0.12), -1px 0 0 rgba(0,0,0,0.04)',
            }}
          >
            {/* ━━ HEADER ━━ */}
            <header className="flex items-center justify-between px-5 h-[64px] shrink-0 border-b border-gray-100/80">
              <div className="flex items-center gap-3">
                {/* Logo mark — the double-bezel technique from high-end skill */}
                <div className="p-[3px] rounded-[14px] bg-gradient-to-b from-[#2D6A4F] to-[#1B4332] shadow-[0_1px_3px_rgba(0,0,0,0.2)]">
                  <div
                    className="w-9 h-9 rounded-[11px] flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #40916C 0%, #2D6A4F 100%)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25)',
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/90">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
                      <circle cx="7.5" cy="10" r="1" fill="currentColor" />
                      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
                      <circle cx="16.5" cy="10" r="1" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                <div className="leading-tight">
                  <h2 className="text-[15px] font-semibold text-gray-900 tracking-[-0.02em]">Arogya AI</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] text-gray-400 font-medium">Online</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setAIOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 active:scale-95 transition-all duration-150"
                style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
              >
                <X className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </header>

            {/* ━━ MESSAGES ━━ */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 py-5 space-y-5">
                {messages.map((msg, i) => {
                  const isUser = msg.role === 'user'
                  const text = msg.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('').trim()
                  const isEmpty = !isUser && text === ''

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, transform: 'translateY(8px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      transition={{
                        duration: 0.3,
                        ease: EASE_OUT as any,
                        delay: Math.min(i * 0.03, 0.12),
                      }}
                      className={`flex w-full ${isUser ? 'justify-end' : 'justify-start items-start gap-3'}`}
                    >
                      {!isUser && (
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm mt-0.5">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                        </div>
                      )}

                      {isUser ? (
                        <div className="max-w-[82%] px-4 py-2.5 rounded-[20px] rounded-br-[6px] text-[14.5px] leading-[1.6] text-white font-[450]"
                          style={{
                            background: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          }}
                        >
                          {text}
                        </div>
                      ) : isEmpty && isAnalyzing ? (
                        <ThinkingState />
                      ) : (
                        <div className="max-w-[85%] text-[14.5px] leading-[1.65] text-gray-700">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-outside mb-3 space-y-1 ml-4" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-outside mb-3 space-y-1 ml-4" {...props} />,
                              li: ({ node, ...props }) => <li className="text-[14px] pl-0.5" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                              table: ({ node, ...props }) => (
                                <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 bg-white">
                                  <table className="min-w-full text-[13px]" {...props} />
                                </div>
                              ),
                              thead: ({ node, ...props }) => <thead className="bg-gray-50" {...props} />,
                              th: ({ node, ...props }) => (
                                <th className="px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200" {...props} />
                              ),
                              tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-100" {...props} />,
                              td: ({ node, ...props }) => <td className="px-3 py-2 text-[13px] text-gray-700" {...props} />,
                            }}
                          >
                            {msg.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </motion.div>
                  )
                })}

                {/* Show thinking state when we don't have an empty assistant message yet */}
                <AnimatePresence>
                  {isAnalyzing && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                    <motion.div
                      initial={{ opacity: 0, transform: 'translateY(8px)' }}
                      animate={{ opacity: 1, transform: 'translateY(0px)' }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2, ease: EASE_OUT as any }}
                      className="flex justify-start items-start gap-3 w-full"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100 shadow-sm mt-0.5">
                        <Leaf className="w-4 h-4 text-emerald-600" />
                      </div>
                      <ThinkingState />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <div className="flex justify-center">
                    <div className="bg-red-50 text-red-600 rounded-xl px-4 py-2.5 text-[13px] font-medium border border-red-100">
                      Something went wrong. Please try again.
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* ━━ INPUT ━━ */}
            <div className="shrink-0 border-t border-gray-100/80 p-4">
              <form onSubmit={handleSubmit} className="relative">
                {/* Double-bezel input wrapper */}
                <div
                  className="rounded-[22px] p-[1px]"
                  style={{
                    background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.03) 100%)',
                  }}
                >
                  <div className="flex items-end gap-2 bg-gray-50 rounded-[21px] pl-4 pr-2 py-2"
                    style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                  >
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Ask about plants, orders..."
                      rows={1}
                      className="flex-1 bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 font-[450] outline-none resize-none leading-[1.5] max-h-[120px] py-1.5"
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 disabled:opacity-0 disabled:scale-75 active:scale-90"
                      style={{
                        background: input.trim() && !isLoading
                          ? 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)'
                          : 'transparent',
                        transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)',
                        boxShadow: input.trim() && !isLoading ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                      }}
                    >
                      <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </form>
              <p className="text-center mt-2.5 text-[10px] text-gray-400 tracking-wide">
                Arogya AI can make mistakes · Verify important advice
              </p>
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>
    </>
  )
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   THINKING STATE — Classic Bouncing Dots
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ThinkingState() {
  return (
    <div className="flex items-center gap-1.5 h-[36px] px-3 py-2 bg-gray-100/50 rounded-2xl rounded-tl-sm w-fit">
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-1.5 h-1.5 bg-[#40916C] rounded-full"
      />
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
        className="w-1.5 h-1.5 bg-[#40916C] rounded-full"
      />
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        className="w-1.5 h-1.5 bg-[#40916C] rounded-full"
      />
    </div>
  )
}
