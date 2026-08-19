'use client'

import { useState, useEffect } from 'react'
import { Search, Users as UsersIcon, ShieldCheck, Mail, Loader2 } from 'lucide-react'
import { adminDbProxy } from '@/lib/admin-proxy'
import { AdminPageHeader } from '@/components/admin/AdminPageHeader'

export default function CustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await adminDbProxy({
        action: 'select',
        table: 'users',
        order: { column: 'created_at', ascending: false },
      })
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    try {
      await adminDbProxy({
        action: 'update',
        table: 'users',
        data: { role: newRole },
        match: { id: userId },
      })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error: any) {
      alert('Error updating role: ' + error.message)
    }
    setUpdatingId(null)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || (user.role || 'user') === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6 text-[#111827] font-sans pb-12">
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Registered accounts, contact details, and staff roles for the admin panel."
      />
      
      {/* Header Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:border-[#059669] focus:ring-1 focus:ring-[#059669] outline-none text-sm font-semibold text-[#111827] placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm font-semibold text-[#374151] shadow-2xs outline-none"
          >
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs font-black uppercase tracking-wider text-[#374151] shadow-2xs">
          <UsersIcon className="w-4 h-4 text-[#111827]" />
          {users.length} Total Users Registered
        </div>
      </div>

      {/* Customers Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-xs uppercase tracking-wider text-[#6B7280] font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" /></th>
                <th className="p-4 font-bold">USER & CONTACT</th>
                <th className="p-4 font-bold">ASSIGNED ROLE</th>
                <th className="p-4 font-bold">JOINED DATE</th>
                <th className="p-4 pr-6 font-bold text-right">ROLE MANAGEMENT</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-[#6B7280]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#111827] mx-auto mb-2" />
                    <span className="text-xs font-bold text-[#374151]">Loading user registry...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-[#9CA3AF] italic">
                    No matching users found in registry.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F9FAFB]/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-[#D1D5DB] text-[#111827] focus:ring-[#059669] cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-lg bg-[#E5E7EB] text-[#111827] border border-[#E5E7EB] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                          {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#111827] text-sm leading-snug">{user.full_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-[#6B7280] mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-[#9CA3AF]" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        user.role === 'admin' ? 'bg-[#059669] text-white shadow-sm border-0 hover:bg-[#047857] border-[#059669]' :
                        user.role === 'manager' || user.role === 'editor' ? 'bg-[#E5E7EB] text-[#111827] border-[#D1D5DB]' :
                        'bg-[#F9FAFB] text-[#4B5563] border-[#E5E7EB]'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-white" /> : <UsersIcon className="w-3 h-3" />}
                        {user.role || 'user'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-[#4B5563]">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {updatingId === user.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#111827] inline-block" />
                      ) : (
                        <select 
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-white border border-[#E5E7EB] text-[#111827] text-xs font-bold rounded-lg focus:ring-1 focus:ring-[#059669] focus:border-[#059669] py-1.5 px-3 outline-none shadow-2xs cursor-pointer ml-auto transition-all hover:border-[#059669]"
                        >
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
