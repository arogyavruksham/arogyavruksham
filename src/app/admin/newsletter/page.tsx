'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, Mail, Plus, Search, Trash2, Users } from 'lucide-react'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'
import { adminDbProxy } from '@/lib/admin-proxy'
import { getLocalSubscribers, saveLocalSubscribers, type NewsletterSubscriber } from '@/lib/newsletter'

function mergeLists(remote: NewsletterSubscriber[], local: NewsletterSubscriber[]) {
  const map = new Map<string, NewsletterSubscriber>()
  ;[...local, ...remote].forEach((s) => {
    const key = s.email.toLowerCase()
    if (!map.has(key)) map.set(key, s)
  })
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const load = async () => {
    setLoading(true)
    const local = getLocalSubscribers()
    let remote: NewsletterSubscriber[] = []
    try {
      const { data } = await adminDbProxy({
        action: 'select',
        table: 'newsletter_subscribers',
        order: { column: 'created_at', ascending: false },
      })
      remote = (data || []).map((row: any) => ({
        id: row.id,
        email: row.email,
        created_at: row.created_at,
        source: row.source || 'site',
      }))
    } catch {
      remote = []
    }
    const merged = mergeLists(remote, local)
    saveLocalSubscribers(merged)
    setSubscribers(merged)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return subscribers
    return subscribers.filter((s) => s.email.includes(search.toLowerCase()))
  }, [subscribers, search])

  const thisMonth = subscribers.filter((s) => {
    const d = new Date(s.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return
    setSaving(true)
    try {
      if (subscribers.some((s) => s.email === trimmed)) {
        setMessage('That email is already subscribed.')
      } else {
        const row: NewsletterSubscriber = {
          id: crypto.randomUUID(),
          email: trimmed,
          created_at: new Date().toISOString(),
          source: 'admin',
        }
        try {
          await adminDbProxy({
            action: 'insert',
            table: 'newsletter_subscribers',
            data: { email: trimmed, source: 'admin' },
          })
        } catch {
          // Table may not exist yet; local copy still works
        }
        const next = [row, ...subscribers]
        saveLocalSubscribers(next)
        setSubscribers(next)
        setEmail('')
        setMessage('Subscriber added.')
      }
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const handleDelete = async (item: NewsletterSubscriber) => {
    try {
      await adminDbProxy({
        action: 'delete',
        table: 'newsletter_subscribers',
        match: { email: item.email },
      })
    } catch {
      // ignore remote miss
    }
    const next = subscribers.filter((s) => s.email !== item.email)
    saveLocalSubscribers(next)
    setSubscribers(next)
  }

  const exportCsv = () => {
    const csv = ['Email,Source,Subscribed At', ...filtered.map((s) => `${s.email},${s.source},${s.created_at}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `newsletter_${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 pb-12">
      <AdminPageHeader
        eyebrow="Marketing"
        title="Newsletter"
        description="Emails collected from the store footer and anyone you add here. Export the list anytime."
        actions={
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold text-[#374151] hover:bg-[#F9FAFB] shadow-2xs">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3">
          <p className="text-xs font-bold text-[#6B7280] uppercase">Total subscribers</p>
          <p className="text-2xl font-black text-[#111827] mt-2">{subscribers.length}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3">
          <p className="text-xs font-bold text-[#6B7280] uppercase">New this month</p>
          <p className="text-2xl font-black text-[#111827] mt-2">{thisMonth}</p>
        </div>
        <div className="bg-white border border-[#E5E7EB] rounded-xl p-3">
          <p className="text-xs font-bold text-[#6B7280] uppercase">Signup source</p>
          <p className="text-sm font-semibold text-[#374151] mt-3">Store footer + admin add</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-[#E5E7EB] rounded-2xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Add a subscriber email"
            className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
          />
        </div>
        <button type="submit" disabled={saving} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-bold hover:bg-gray-900 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add email
        </button>
      </form>
      {message && <p className="text-sm font-semibold text-[#059669] -mt-3">{message}</p>}

      <div className="flex items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-xl text-sm font-semibold outline-none focus:border-[#059669]"
          />
        </div>
        <span className="text-xs font-bold text-[#6B7280] flex items-center gap-1">
          <Users className="w-4 h-4" /> {filtered.length} shown
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        <table className="w-full text-left min-w-[640px]">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs uppercase tracking-wider text-[#6B7280] font-bold">
              <th className="p-4 pl-6">Email</th>
              <th className="p-4">Source</th>
              <th className="p-4">Subscribed</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#6B7280]">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading subscribers...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#9CA3AF] italic">
                  No subscribers yet. Signups from the store footer will appear here.
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.email} className="hover:bg-[#F9FAFB]/80">
                  <td className="p-4 pl-6 font-bold text-[#111827]">{item.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E5E7EB] text-[#374151] capitalize">{item.source}</span>
                  </td>
                  <td className="p-4 font-mono text-xs text-[#4B5563]">
                    {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button onClick={() => handleDelete(item)} className="p-2 text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
