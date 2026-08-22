'use client'

import { useState, useRef, useEffect } from 'react'
import { X, ArrowUp, Bot } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { motion, AnimatePresence, Transition } from 'framer-motion'

// Spring configs inspired by Apple & Emil Kowalski
const springConfig: Transition = { type: 'spring', bounce: 0.15, duration: 0.5 }
const springTap: Transition = { type: 'spring', stiffness: 400, damping: 25 }

export function Chatbot() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const user = useAuthStore((state) => state.user)
  const { messages, sendMessage, status, error } = useChat({
    messages: [
      { id: '1', role: 'assistant', parts: [{ type: 'text', text: 'Hello! I\'m your plant care assistant. How can I help you today?' }] }
    ] as any
  })
  const isLoading = status === 'streaming' || status === 'submitted'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    
    const messageId = user?.email ? `useremail_${encodeURIComponent(user.email)}_${Date.now()}` : `msg_${Date.now()}`
    
    sendMessage({ id: messageId, role: 'user', parts: [{ type: 'text', text: input.trim() }] } as any)
    setInput('')
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  if (pathname !== '/') {
    return null
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springConfig}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[110px] sm:bottom-24 md:bottom-6 left-6 z-[90] focus:outline-none"
            aria-label="Open Chat"
          >
            <div className="relative group">
              <div className="w-14 h-14 bg-[#11311F] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/10 backdrop-blur-md">
                <Bot className="w-6 h-6" />
              </div>
              {/* Organic Breathing Ping */}
              <motion.span 
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#A4E4BA] rounded-full border-2 border-white shadow-sm" 
              />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.2, ease: "easeOut" } }}
            transition={springConfig}
            className="fixed inset-0 md:inset-auto md:bottom-24 md:left-6 md:w-[380px] md:h-[650px] md:max-h-[calc(100vh-120px)] bg-white/95 backdrop-blur-xl md:rounded-3xl md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] md:border md:border-black/5 flex flex-col overflow-hidden z-[9999] origin-bottom-left"
          >
            {/* Header */}
            <div className="bg-[#11311F] text-white px-5 py-4 flex justify-between items-center shrink-0 relative overflow-hidden">
              {/* Ambient gradient */}
              <div className="absolute inset-0 opacity-[0.03]">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                  <Bot className="w-5 h-5 text-[#A4E4BA]" />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-semibold text-[15px] tracking-tight leading-tight text-white/90">Plant Assistant</h3>
                  <p className="text-[12px] text-white/50 font-medium tracking-wide">Expert care & guidance</p>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                transition={springTap}
                onClick={() => setIsOpen(false)} 
                className="relative z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-[#FAFBFA]/80">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                const textContent = msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('').trim();
                const isAssistantEmpty = !isUser && textContent === '';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: Math.min(index * 0.05, 0.2) }}
                    key={msg.id} 
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-[#E9F3ED] border border-[#d3e5db] flex items-center justify-center shrink-0 mr-2.5 mt-auto shadow-sm">
                        <Bot className="w-3.5 h-3.5 text-[#235839]" />
                      </div>
                    )}
                    <div className={`max-w-[82%] text-[14.5px] leading-relaxed tracking-[-0.01em] ${
                      isUser 
                        ? 'bg-[#11311F] text-white rounded-[20px] rounded-br-sm px-4 py-3 shadow-[0_2px_10px_rgb(17,49,31,0.2)]' 
                        : 'bg-white border border-gray-200/60 text-gray-800 rounded-[20px] rounded-bl-sm px-4 py-3 shadow-[0_2px_8px_rgb(0,0,0,0.04)]'
                    }`}>
                      {isUser ? (
                        textContent
                      ) : isAssistantEmpty && isLoading ? (
                        <TypingIndicator />
                      ) : (
                        <div className="space-y-3 overflow-x-auto prose-sm prose-p:my-0">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-0.5 ml-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-0.5 ml-1" {...props} />,
                              li: ({node, ...props}) => <li className="text-[14px]" {...props} />,
                              strong: ({node, ...props}) => <strong className="font-semibold text-[#11311F]" {...props} />,
                              table: ({node, ...props}) => (
                                <div className="overflow-x-auto my-3 rounded-xl border border-gray-200/60 shadow-sm">
                                  <table className="min-w-full text-[13px]" {...props} />
                                </div>
                              ),
                              thead: ({node, ...props}) => <thead className="bg-[#F6F9F7]" {...props} />,
                              th: ({node, ...props}) => <th className="px-3 py-2.5 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/60" {...props} />,
                              tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-100" {...props} />,
                              td: ({node, ...props}) => <td className="px-3 py-2.5 text-[13px] text-gray-700" {...props} />
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
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex justify-start origin-bottom-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#E9F3ED] border border-[#d3e5db] flex items-center justify-center shrink-0 mr-2.5 mt-auto shadow-sm">
                      <Bot className="w-3.5 h-3.5 text-[#235839]" />
                    </div>
                    <div className="bg-white border border-gray-200/60 rounded-[20px] rounded-bl-sm px-4 py-3.5 flex items-center shadow-[0_2px_8px_rgb(0,0,0,0.04)]">
                      <TypingIndicator />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mt-4">
                  <div className="bg-red-50 text-red-600 rounded-xl px-4 py-2 text-[13px] font-medium border border-red-100 shadow-sm">
                    Connection error. Please try again.
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-4 bg-white/90 backdrop-blur-md border-t border-black/5 shrink-0 z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about plant care..."
                  className="w-full bg-[#F6F9F7] text-[14.5px] outline-none text-gray-800 placeholder:text-gray-400 rounded-2xl pl-4 pr-12 py-3.5 border border-gray-200/60 focus:border-[#235839]/40 focus:bg-white focus:shadow-[0_4px_15px_rgb(0,0,0,0.03)] transition-all duration-300"
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
                      className="absolute right-1.5 w-9 h-9 flex items-center justify-center bg-[#11311F] text-white rounded-xl shadow-md"
                    >
                      <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Organic Sine-Wave Typing Indicator
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 h-5 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
          className="w-1.5 h-1.5 bg-[#235839]/50 rounded-full"
        />
      ))}
    </div>
  )
}
