
'use client'

import { useState, useEffect, useRef } from 'react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { useAuthStore } from '@/store/authStore'
import { Bot, Calendar, Loader2, MessageSquare, AlertCircle, ShoppingBag, Users, Activity } from 'lucide-react'

export default function AISummaryPage() {
  const [loading, setLoading] = useState(true)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [stats, setStats] = useState({ orders: 0, customers: 0, chats: 0 })
  const [summary, setSummary] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  // Ref to track if we need to auto-generate based on stats changing
  const prevStats = useRef({ orders: -1, customers: -1, chats: -1 })
  const initialLoadDone = useRef(false)

  useEffect(() => {
    // Initial fetch
    fetchTodayStats(true)

    // Poll every 60 seconds
    const interval = setInterval(() => {
      fetchTodayStats(false)
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  async function fetchTodayStats(isInitial: boolean = false) {
    if (isInitial) setLoading(true)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const [ordersRes, usersRes, chatsRes] = await Promise.all([
        adminDbProxy({ action: 'select', table: 'orders' }).catch(e => { console.error(e); return { data: [] } }),
        adminDbProxy({ action: 'select', table: 'users' }).catch(e => { console.error(e); return { data: [] } }),
        adminDbProxy({ action: 'select', table: 'chat_messages' }).catch(e => { console.error(e); return { data: [] } })
      ])

      const todayOrders = (ordersRes.data || []).filter((o: any) => new Date(o.created_at) >= today).length
      const todayUsers = (usersRes.data || []).filter((u: any) => new Date(u.created_at) >= today).length
      const todayChats = (chatsRes.data || []).filter((m: any) => new Date(m.created_at) >= today).length

      const newStats = { orders: todayOrders, customers: todayUsers, chats: todayChats }
      setStats(newStats)
      setLastChecked(new Date())

      // Auto-generate if stats changed, or if it's the initial load
      if (
        isInitial ||
        newStats.orders !== prevStats.current.orders ||
        newStats.customers !== prevStats.current.customers ||
        newStats.chats !== prevStats.current.chats
      ) {
        prevStats.current = newStats
        generateSummary()
      }
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      if (isInitial) setLoading(false)
    }
  }

  async function generateSummary() {
    setSummaryLoading(true)
    try {
      const adminPassword = useAuthStore.getState().adminPassword
      const res = await fetch('/api/admin/chat-summary', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminPassword}`
        },
        body: JSON.stringify({}) 
      })

      const data = await res.json()
      if (res.ok) {
        setSummary(data.summary)
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      setError(`Failed to generate summary: ${err.message}`)
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <div className="space-y-6 text-gray-900 font-sans pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-gray-900" />
            Autonomous Agent Insights
          </h1>
          <p className="text-sm font-semibold text-gray-500 mt-1">Live monitoring and intelligent alerts for your store.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#FCFCFD] text-black px-4 py-2 border border-emerald-200 rounded-xl shadow-xs">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-bold">Agent Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Logs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-2xs p-6 space-y-4 relative overflow-hidden">
            {summaryLoading && (
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-100 overflow-hidden">
                <div className="h-full bg-black animate-[progress_1.5s_ease-in-out_infinite] w-1/2 rounded-full"></div>
              </div>
            )}
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
                  <div className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-500"/> <span className="font-semibold">Chat Messages</span></div>
                  <span className="text-xl font-black">{stats.chats}</span>
                </div>
              </div>
            )}
            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Auto-refreshing every 60s</span>
              <span>Last checked: {lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
            </div>
          </div>

          <div className="bg-black text-white p-5 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h4 className="font-bold mb-2 flex items-center gap-2"><Bot className="w-4 h-4"/> Agent Status</h4>
            <p className="text-sm text-emerald-100 leading-relaxed">
              I am actively monitoring the store. If stock drops low or new orders arrive, I will instantly re-analyze and update the insights on the right.
            </p>
          </div>
        </div>

        {/* Right Column: AI Summary Result */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2rem] border border-black/5 shadow-2xs p-6 min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-900" />
                Live Agent Report
              </h3>
              {summaryLoading && <span className="text-xs font-bold text-gray-900 animate-pulse bg-[#FCFCFD] px-3 py-1 rounded-full">Analyzing...</span>}
            </div>
            
            {error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold">{error}</div>
            ) : summary ? (
              <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                {summary.split('\n').map((line, i) => {
                  if (line.startsWith('## ')) return <h2 key={i} className="text-lg font-black text-gray-900 mt-4 mb-2">{line.replace('## ', '')}</h2>
                  if (line.startsWith('### ')) return <h3 key={i} className="text-base font-bold text-gray-800 mt-3 mb-1">{line.replace('### ', '')}</h3>
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
                <Loader2 className="w-12 h-12 text-emerald-200 mb-4 animate-spin" />
                <p className="text-sm font-medium text-center">Initializing autonomous analysis...</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}} />
    </div>
  )
}
