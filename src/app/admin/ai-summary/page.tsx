'use client'

import { useState, useEffect } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { Bot, Calendar, Loader2, MessageSquare, AlertCircle, ShoppingBag, Users } from 'lucide-react'

export default function AISummaryPage() {
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [stats, setStats] = useState({ orders: 0, customers: 0, chats: 0 })
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTodayStats()
  }, [])

  async function fetchTodayStats() {
    setLoading(true)
    setError(null)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const [ordersRes, usersRes, chatsRes] = await Promise.all([
        adminDbProxy({ action: 'select', table: 'orders' }),
        adminDbProxy({ action: 'select', table: 'users' }),
        adminDbProxy({ action: 'select', table: 'chat_messages' })
      ])

      const todayOrders = (ordersRes.data || []).filter((o: any) => new Date(o.created_at) >= today).length
      const todayUsers = (usersRes.data || []).filter((u: any) => new Date(u.created_at) >= today).length
      const todayChats = (chatsRes.data || []).filter((m: any) => new Date(m.created_at) >= today).length

      setStats({ orders: todayOrders, customers: todayUsers, chats: todayChats })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function generateSummary() {
    setSummaryLoading(true)
    try {
      const res = await fetch('/api/admin/chat-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // API will fetch everything on the server
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
            Website Activity & AI Insights
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">Review daily website activity, orders, and customer interactions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-xl shadow-xs">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-bold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900">Today's Traffic</h3>
            </div>
            {loading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-blue-500"/> <span className="font-semibold">Orders</span></div>
                  <span className="text-xl font-black">{stats.orders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Users className="w-5 h-5 text-purple-500"/> <span className="font-semibold">New Customers</span></div>
                  <span className="text-xl font-black">{stats.customers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-500"/> <span className="font-semibold">Chat Messages</span></div>
                  <span className="text-xl font-black">{stats.chats}</span>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2 font-medium">Activity recorded since midnight.</p>
          </div>

          <button 
            onClick={generateSummary}
            disabled={summaryLoading || loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-black transition-all shadow-xs disabled:opacity-50"
          >
            {summaryLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
            {summaryLoading ? 'Analyzing Website Data...' : 'Generate Executive Summary'}
          </button>
        </div>

        {/* Right Column: AI Summary Result */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 min-h-[400px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-green-600" />
              DeepSeek AI Insights
            </h3>
            
            {summary ? (
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                {summary.split('\n').map((line, i) => {
                  if (line.startsWith('##')) return <h2 key={i} className="text-lg font-black text-gray-900 mt-4 mb-2">{line.replace('##', '')}</h2>
                  if (line.startsWith('###')) return <h3 key={i} className="text-base font-bold text-gray-800 mt-3 mb-1">{line.replace('###', '')}</h3>
                  if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>
                  if (line.startsWith('**')) {
                    const match = line.match(/\*\*(.*?)\*\*(.*)/);
                    if (match) return <p key={i} className="leading-relaxed"><strong>{match[1]}</strong>{match[2]}</p>
                  }
                  if (line.trim() === '') return <br key={i} />
                  return <p key={i} className="leading-relaxed">{line}</p>
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Bot className="w-16 h-16 text-gray-200 mb-4" />
                <p className="text-sm font-medium text-center">Click "Generate Executive Summary" to analyze today's activity using DeepSeek AI.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
