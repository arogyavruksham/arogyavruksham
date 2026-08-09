'use client'

import { useState, useEffect } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Bot, Calendar, Loader2, MessageSquare, AlertCircle } from 'lucide-react'

type ChatMessage = {
  id: string
  session_id: string
  role: 'user' | 'model'
  content: string
  created_at: string
}

export default function AISummaryPage() {
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodayMessages()
  }, [])

  async function fetchTodayMessages() {
    setLoading(true)
    setError(null)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data, error } = await adminDbProxy({
        action: 'select',
        table: 'chat_messages',
        order: { column: 'created_at', ascending: true }
      })
      
      if (error) throw new Error(error.message)
      
      // Filter for today client-side for simplicity since admin proxy doesn't support complex filters
      const todayMessages = (data || []).filter((msg: ChatMessage) => new Date(msg.created_at) >= today)
      setMessages(todayMessages)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateSummary() {
    if (messages.length === 0) return
    
    setSummaryLoading(true)
    try {
      // Group by session to make it readable
      const sessions: Record<string, ChatMessage[]> = {}
      messages.forEach(msg => {
        if (!sessions[msg.session_id]) sessions[msg.session_id] = []
        sessions[msg.session_id].push(msg)
      })

      let transcript = "Today's Chat Logs:\n\n"
      Object.keys(sessions).forEach(sessionId => {
        transcript += `--- Session ${sessionId} ---\n`
        sessions[sessionId].forEach(msg => {
          transcript += `${msg.role.toUpperCase()}: ${msg.content}\n`
        })
        transcript += '\n'
      })

      const res = await fetch('/api/admin/chat-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      })

      const data = await res.json()
      if (res.ok) {
        setSummary(data.summary)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      alert(`Failed to generate summary: ${err.message}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-gray-900 font-sans pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-green-600" />
            AI Chat Summaries
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">Review daily customer interactions and insights.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-xs">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Today's Traffic</h3>
              <MessageSquare className="w-5 h-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : (
              <div className="text-4xl font-black text-gray-900">
                {new Set(messages.map(m => m.session_id)).size} <span className="text-base font-medium text-gray-500">sessions</span>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 font-medium">Total of {messages.length} messages exchanged today.</p>
          </div>

          <button 
            onClick={generateSummary}
            disabled={messages.length === 0 || summaryLoading || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xs disabled:opacity-50"
          >
            {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
            {summaryLoading ? 'Analyzing Conversations...' : 'Generate Executive Summary'}
          </button>
        </div>

        {/* Right Column: AI Summary Result */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 min-h-[400px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-600" />
              Executive Summary
            </h3>
            
            {summary ? (
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                {summary.split('\n').map((line, i) => (
                  <p key={i} className="leading-relaxed">{line}</p>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Bot className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-sm font-medium text-center">Click "Generate Executive Summary" to analyze today's chat logs using Gemini AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
