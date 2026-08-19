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
    <div className="space-y-6 text-[#4A3B32] font-sans pb-12">
      <AdminPageHeader
        eyebrow="People"
        title="Customers"
        description="Registered accounts, contact details, and staff roles for the admin panel."
      />
      
      {/* Header Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8ACA3]" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#EBE3D5] rounded-xl focus:border-[#C25934] focus:ring-1 focus:ring-[#C25934] outline-none text-sm font-semibold text-[#4A3B32] placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-white border border-[#EBE3D5] rounded-xl text-sm font-semibold text-[#5C4D43] shadow-2xs outline-none"
          >
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#EBE3D5] rounded-xl text-xs font-black uppercase tracking-wider text-[#5C4D43] shadow-2xs">
          <UsersIcon className="w-4 h-4 text-[#4A3B32]" />
          {users.length} Total Users Registered
        </div>
      </div>

      {/* Customers Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-2xl border border-[#EBE3D5] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-[#FCF8F5] border-b border-[#EBE3D5] text-xs uppercase tracking-wider text-[#96887E] font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-[#E0D5C1] text-[#4A3B32] focus:ring-[#C25934] cursor-pointer" /></th>
                <th className="p-4 font-bold">USER & CONTACT</th>
                <th className="p-4 font-bold">ASSIGNED ROLE</th>
                <th className="p-4 font-bold">JOINED DATE</th>
                <th className="p-4 pr-6 font-bold text-right">ROLE MANAGEMENT</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-[#96887E]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#4A3B32] mx-auto mb-2" />
                    <span className="text-xs font-bold text-[#5C4D43]">Loading user registry...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-[#B8ACA3] italic">
                    No matching users found in registry.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#FCF8F5]/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-[#E0D5C1] text-[#4A3B32] focus:ring-[#C25934] cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-[#F0EAE1] text-[#4A3B32] border border-[#EBE3D5] flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                          {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-[#4A3B32] text-sm leading-snug">{user.full_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-[#96887E] mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-[#B8ACA3]" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        user.role === 'admin' ? 'bg-amber-50 text-amber-700 border border-amber-200 border-[#C25934]' :
                        user.role === 'manager' || user.role === 'editor' ? 'bg-[#F0EAE1] text-[#4A3B32] border-[#E0D5C1]' :
                        'bg-[#FCF8F5] text-[#7A6B61] border-[#EBE3D5]'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-white" /> : <UsersIcon className="w-3 h-3" />}
                        {user.role || 'user'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-[#7A6B61]">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {updatingId === user.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-[#4A3B32] inline-block" />
                      ) : (
                        <select 
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-white border border-[#EBE3D5] text-[#4A3B32] text-xs font-bold rounded-xl focus:ring-1 focus:ring-[#C25934] focus:border-[#C25934] py-1.5 px-3 outline-none shadow-2xs cursor-pointer ml-auto transition-all hover:border-[#C25934]"
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
