'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Sparkles, Send, Loader2, Search, Zap, Leaf } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence, Transition } from 'framer-motion'

const springConfig: Transition = { type: 'spring', bounce: 0, duration: 0.4 }
const springTap: Transition = { type: 'spring', stiffness: 400, damping: 25 }

export function ArogyaAI() {
  const { isAIOpen, setAIOpen } = useUIStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [input, setInput] = useState('')
  const user = useAuthStore((state) => state.user)
  const { messages, sendMessage, status, error } = useChat({
    messages: [
      { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hi! I am Arogya AI, your botanical concierge. How can I assist you with your garden today?' }] }
    ] as any
  })
  
  // Dynamic loading states
  const isAnalyzing = status === 'submitted'
  const isTyping = status === 'streaming'
  const isLoading = isAnalyzing || isTyping

  // Global hotkey
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

  // Focus input
  useEffect(() => {
    if (isAIOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isAIOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAIOpen, status])

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
        <div className="fixed inset-0 z-[9999] flex justify-end overflow-hidden">
          {/* Subtle backdrop dim (not full blur, allows viewing main site) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setAIOpen(false)}
            className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={springConfig}
            className="relative w-full sm:w-[450px] md:w-[500px] h-[100dvh] bg-[#FDFBF7] shadow-[-20px_0_40px_rgba(0,0,0,0.08)] border-l border-white/40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-8 pb-4 bg-[#FDFBF7]/90 backdrop-blur-xl shrink-0 z-10 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#11311F] to-[#235839] rounded-xl blur-[8px] opacity-40" />
                  <div className="relative w-11 h-11 rounded-xl bg-gradient-to-tr from-[#11311F] to-[#235839] flex items-center justify-center shadow-inner border border-white/10">
                    <Sparkles className="w-5 h-5 text-[#A4E4BA]" />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 tracking-tight text-[17px]">Arogya AI</h2>
                  <p className="text-gray-500 text-[12px] font-medium tracking-wide">Botanical Concierge</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gray-100/80 rounded-md text-gray-400 text-[10px] font-bold tracking-widest border border-gray-200">
                  <kbd className="font-sans uppercase">Cmd</kbd> <kbd className="font-sans uppercase">K</kbd>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,0,0,0.04)' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAIOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const textContent = msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('').trim();
                const isAssistantEmpty = !isUser && textContent === '';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: Math.min(index * 0.02, 0.1) }}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} w-full`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-2 mb-2 ml-1">
                        <Leaf className="w-3.5 h-3.5 text-[#235839]/60" />
                        <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Arogya</span>
                      </div>
                    )}
                    
                    <div className={`text-[15px] leading-[1.65] tracking-[-0.01em] w-full ${
                      isUser 
                        ? 'bg-gradient-to-b from-[#11311F] to-[#1a442a] text-white rounded-3xl rounded-tr-sm px-6 py-3.5 max-w-[85%] shadow-sm' 
                        : 'text-gray-800'
                    }`}>
                      {isUser ? (
                        textContent
                      ) : isAssistantEmpty && isAnalyzing ? (
                        <div className="hidden" /> // Animation handled below map
                      ) : (
                        <div className="prose prose-p:my-2 prose-ul:my-2 prose-ol:my-2 max-w-none">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-4 last:mb-0 text-gray-700 font-medium" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-outside mb-4 space-y-1.5 ml-4 text-gray-700" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-outside mb-4 space-y-1.5 ml-4 text-gray-700" {...props} />,
                              li: ({node, ...props}) => <li className="text-[14.5px] pl-1" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-5 rounded-xl border border-gray-200/60 shadow-sm bg-white">
                                  <table className="min-w-full text-[13px]" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-gray-50/50" {...props} />,
                              th: ({node, ...props}) => <th className="px-4 py-3 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100" {...props} />,
                              tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-50" {...props} />,
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

              {/* Dynamic Loading State */}
              <AnimatePresence mode="wait">
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, filter: "blur(4px)" }}
                    className="flex flex-col items-start w-full mt-4"
                  >
                    <div className="flex items-center gap-2 mb-2 ml-1">
                      <Leaf className="w-3.5 h-3.5 text-[#235839]/60" />
                      <span className="text-[11px] font-bold tracking-widest uppercase text-gray-400">Arogya</span>
                    </div>
                    <EyeCatchingLoader />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-6">
                  <div className="bg-red-50 text-red-600 rounded-xl px-5 py-3 text-[13px] font-semibold border border-red-100">
                    Connection interrupted. Please try again.
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7] to-transparent shrink-0">
              <form onSubmit={handleSubmit} className="relative flex items-center group">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Message Arogya AI..."
                  className="w-full bg-white text-[15px] outline-none text-gray-900 placeholder:text-gray-400 font-medium rounded-[24px] pl-6 pr-14 py-4 border border-gray-200/80 focus:border-[#235839]/30 focus:shadow-[0_8px_30px_rgb(0,0,0,0.04)] shadow-sm transition-all duration-300"
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
                      className="absolute right-2.5 w-[38px] h-[38px] flex items-center justify-center bg-[#11311F] text-white rounded-full shadow-md"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
              <div className="text-center mt-4">
                <span className="text-[10px] text-gray-400 font-semibold tracking-wide uppercase">
                  AI can make mistakes. Verify critical advice.
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ── NEW: Eye Catching Dynamic Loader ──
function EyeCatchingLoader() {
  return (
    <div className="flex items-center gap-4 bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm overflow-hidden relative w-[220px]">
      {/* Animated glowing background sweep */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A4E4BA]/10 to-transparent skew-x-12"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      
      {/* Rotating geometric element */}
      <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-[#235839]/30"
        />
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-2.5 h-2.5 bg-[#235839] rounded-sm rotate-45"
        />
      </div>

      <div className="flex flex-col relative z-10">
        <span className="text-[13px] font-bold text-gray-800 tracking-tight">Analyzing</span>
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Please wait</span>
      </div>
    </div>
  )
}
