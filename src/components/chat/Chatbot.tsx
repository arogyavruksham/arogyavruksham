'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react'

type Message = {
  id: string
  role: 'user' | 'model'
  content: string
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: 'Hi there! I am your Arogyavruksham assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, history: messages.slice(1) })
      })
      
      const data = await res.json()
      if (res.ok) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: data.reply }])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: `Sorry, I encountered an error: ${error.message}` }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-40 md:bottom-24 right-6 w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 hover:scale-110 transition-all z-40 ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        aria-label="Open Chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-40 md:bottom-24 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right z-50 border border-gray-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`} style={{ height: '500px', maxHeight: 'calc(100vh - 100px)' }}>
        
        {/* Header */}
        <div className="bg-green-600 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h3 className="font-bold">Arogyavruksham Support</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                msg.role === 'user' 
                  ? 'bg-green-600 text-white rounded-tr-sm' 
                  : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-sm">
                <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                <span className="text-xs text-gray-500 font-medium">Typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2 relative">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-green-500 focus:ring-1 focus:ring-green-500 rounded-full px-4 py-2.5 text-sm outline-none transition-all pr-12"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1 w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors"
            >
              <Send className="w-4 h-4 -ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
