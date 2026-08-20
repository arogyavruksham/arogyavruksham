'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, Loader2, Sparkles, ArrowUp, Bot } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
  }, [messages])

  if (pathname !== '/') {
    return null
  }

  return (
    <>
      {/* Floating Button — bottom-left, away from WhatsApp on right */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-[110px] sm:bottom-24 md:bottom-6 left-6 z-[90] transition-all duration-300 ${isOpen ? 'opacity-0 pointer-events-none scale-75' : 'opacity-100 scale-100'}`}
        aria-label="Open Chat"
      >
        <div className="relative group">
          <div className="w-14 h-14 bg-[#11311F] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#11311F]/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
            <Bot className="w-7 h-7" />
          </div>
          {/* Ping dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#A4E4BA] rounded-full border-2 border-white" />
        </div>
      </button>

      {/* Chat Panel */}
      <div className={`fixed inset-0 md:inset-auto md:bottom-24 md:left-6 md:w-[380px] md:h-[650px] md:max-h-[calc(100vh-120px)] bg-white md:rounded-2xl md:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] md:border md:border-gray-100 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-left z-[9999] ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-[#11311F] text-white px-6 py-5 flex justify-between items-center shrink-0 relative overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-[#A4E4BA]" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] leading-tight">Plant Assistant</h3>
              <p className="text-[11px] text-white/60 font-medium">Ask me anything about plants</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="relative z-10 w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-[#FAFBFA]">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const textContent = msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('').trim();
            const isAssistantEmpty = !isUser && textContent === '';
            
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#E9F3ED] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <Bot className="w-4 h-4 text-[#235839]" />
                  </div>
                )}
                <div className={`max-w-[80%] text-[14px] leading-relaxed ${
                  isUser 
                    ? 'bg-[#11311F] text-white rounded-2xl rounded-br-lg px-4 py-3' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-2xl rounded-bl-lg px-4 py-3 shadow-sm'
                }`}>
                  {isUser ? (
                    textContent
                  ) : isAssistantEmpty && isLoading ? (
                    <div className="flex items-center gap-1.5 h-5 px-1">
                      <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <div className="space-y-2 overflow-x-auto prose-sm">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-0.5" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-0.5" {...props} />,
                          li: ({node, ...props}) => <li className="text-[13px]" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-semibold text-[#11311F]" {...props} />,
                          table: ({node, ...props}) => (
                            <div className="overflow-x-auto my-2 rounded-lg border border-gray-100">
                              <table className="min-w-full text-[12px]" {...props} />
                            </div>
                          ),
                          thead: ({node, ...props}) => <thead className="bg-[#F6F9F7]" {...props} />,
                          th: ({node, ...props}) => <th className="px-3 py-2 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider" {...props} />,
                          tbody: ({node, ...props}) => <tbody className="bg-white divide-y divide-gray-50" {...props} />,
                          td: ({node, ...props}) => <td className="px-3 py-2 text-[12px] text-gray-700" {...props} />
                        }}
                      >
                        {msg.parts?.map((p: any) => p.type === 'text' ? p.text : '').join('')}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {isLoading && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
            <div className="flex justify-start">
              <div className="w-7 h-7 rounded-full bg-[#E9F3ED] flex items-center justify-center shrink-0 mr-2 mt-0.5">
                <Bot className="w-4 h-4 text-[#235839]" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-lg px-4 py-3 flex items-center shadow-sm">
                <div className="flex items-center gap-1.5 h-5 px-1">
                  <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-[#235839]/60 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <div className="bg-red-50 text-red-500 rounded-xl px-4 py-2 text-[13px] font-medium border border-red-100">
                Connection error. Please try again.
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-4 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-[#F6F9F7] rounded-2xl pl-4 pr-1.5 py-1.5 border border-gray-100 focus-within:border-[#235839]/30 focus-within:bg-white transition-all">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about plant care..."
              className="flex-1 bg-transparent text-[14px] outline-none text-gray-800 placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 flex items-center justify-center bg-[#11311F] text-white rounded-xl hover:bg-black disabled:opacity-30 disabled:hover:bg-[#11311F] transition-all active:scale-90 shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
