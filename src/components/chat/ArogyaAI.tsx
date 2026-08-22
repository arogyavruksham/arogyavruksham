'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Sparkles, Send, Loader2, Search } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence, Transition } from 'framer-motion'
import { usePathname } from 'next/navigation'

const springConfig: Transition = { type: 'spring', bounce: 0.15, duration: 0.5 }
const springTap: Transition = { type: 'spring', stiffness: 400, damping: 25 }

export function ArogyaAI() {
  const { isAIOpen, setAIOpen } = useUIStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()

  const [input, setInput] = useState('')
  const user = useAuthStore((state) => state.user)
  const { messages, sendMessage, status, error } = useChat({
    messages: [
      { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hi! I am Arogya AI, your premium plant care concierge. How can I assist you today?' }] }
    ] as any
  })
  const isLoading = status === 'streaming' || status === 'submitted'

  // Global hotkey (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setAIOpen(!isAIOpen)
      }
      if (e.key === 'Escape' && isAIOpen) {
        setAIOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAIOpen, setAIOpen])

  // Focus input on open
  useEffect(() => {
    if (isAIOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isAIOpen])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAIOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const messageId = user?.email ? `useremail_${encodeURIComponent(user.email)}_${Date.now()}` : `msg_${Date.now()}`
    
    sendMessage({ id: messageId, role: 'user', parts: [{ type: 'text', text: input.trim() }] } as any)
    setInput('')
  }

  return (
    <AnimatePresence>
      {isAIOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAIOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springConfig}
            className="relative w-full max-w-[800px] h-[85vh] sm:h-[80vh] bg-white/95 backdrop-blur-2xl rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/5 shrink-0 bg-white/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#11311F] to-[#235839] flex items-center justify-center shadow-inner">
                  <Sparkles className="w-5 h-5 text-[#A4E4BA]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 tracking-tight text-[16px]">Arogya AI</h2>
                  <p className="text-gray-500 text-[12px] font-medium tracking-wide">Premium Plant Concierge</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-500 text-[11px] font-medium tracking-wider">
                  <kbd className="font-sans">⌘</kbd> <kbd className="font-sans">K</kbd>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.05)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAIOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Conversational UI (Editorial Layout) */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const textContent = msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('').trim();
                const isAssistantEmpty = !isUser && textContent === '';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: Math.min(index * 0.02, 0.1) }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl mx-auto w-full`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-2 ml-1 text-gray-400">
                        <Sparkles className="w-4 h-4 text-[#235839]" />
                        <span className="text-[12px] font-semibold tracking-wide uppercase">Arogya AI</span>
                      </div>
                    )}
                    
                    <div className={`text-[15px] leading-[1.7] tracking-[-0.01em] w-full ${
                      isUser 
                        ? 'bg-[#F6F9F7] text-gray-900 rounded-3xl rounded-tr-sm px-6 py-4 max-w-[85%] border border-gray-100/50' 
                        : 'text-gray-800'
                    }`}>
                      {isUser ? (
                        textContent
                      ) : isAssistantEmpty && isLoading ? (
                        <ThinkingAnimation />
                      ) : (
                        <div className="prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-gray-700" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 space-y-1 ml-1 text-gray-700" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-1 text-gray-700" {...props} />,
                              li: ({node, ...props}) => <li className="text-[15px]" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-6 rounded-2xl border border-gray-200 shadow-sm">
                                  <table className="min-w-full text-[14px]" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-[#F6F9F7]" {...props} />,
                              th: ({node, ...props}) => <th className="px-4 py-3 text-left text-[12px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200" {...props} />,
                              tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-100" {...props} />,
                              td: ({node, ...props}) => <td className="px-4 py-3 text-[14px] text-gray-700" {...props} />
                            }}
                          >
                            {msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('')}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {/* Loading Indicator for new streaming messages */}
              <AnimatePresence>
                {isLoading && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-start max-w-3xl mx-auto w-full"
                  >
                    <div className="flex items-center gap-2 mb-2 ml-1 text-gray-400">
                      <Sparkles className="w-4 h-4 text-[#235839]" />
                      <span className="text-[12px] font-semibold tracking-wide uppercase">Arogya AI</span>
                    </div>
                    <ThinkingAnimation />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-6">
                  <div className="bg-red-50 text-red-600 rounded-2xl px-6 py-3 text-[14px] font-medium border border-red-100">
                    Connection error. Please try again.
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Form */}
            <div className="px-6 py-5 bg-white/80 backdrop-blur-md border-t border-black/5 shrink-0 z-10">
              <form onSubmit={handleSubmit} className="relative flex items-center max-w-3xl mx-auto">
                <div className="absolute left-4 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask anything about plants, care, or orders..."
                  className="w-full bg-[#F6F9F7] text-[15px] outline-none text-gray-900 placeholder:text-gray-400 rounded-full pl-12 pr-14 py-4 border border-gray-200/60 focus:border-[#235839]/40 focus:bg-white focus:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300"
                />
                <AnimatePresence>
                  {input.trim() && !isLoading && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.5, rotate: 45 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.9 }}
                      transition={springTap}
                      type="submit"
                      className="absolute right-2 w-10 h-10 flex items-center justify-center bg-[#11311F] text-white rounded-full shadow-lg"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
              <div className="text-center mt-3">
                <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                  Arogya AI can make mistakes. Verify critical plant care advice.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// Beautiful Premium Glowing Loading Animation
function ThinkingAnimation() {
  return (
    <div className="flex items-center gap-3 h-10 w-32 px-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 shadow-inner">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0 }}
        className="w-2 h-2 rounded-full bg-[#235839]"
      />
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
        className="w-2 h-2 rounded-full bg-[#235839]"
      />
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="w-2 h-2 rounded-full bg-[#235839]"
      />
      <span className="text-[12px] font-medium text-gray-500 tracking-wide ml-1">Thinking</span>
    </div>
  )
}
