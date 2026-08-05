'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Users as UsersIcon, Shield, ShieldCheck, Mail, Calendar, Loader2, Filter } from 'lucide-react'

export default function CustomersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching users:', error)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId)
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) {
      alert('Error updating role: ' + error.message)
    } else {
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    }
    setUpdatingId(null)
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 text-gray-900 font-sans pb-12">
      
      {/* Header Controls - Exact Screenshot Style */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 shadow-2xs transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shrink-0 shadow-2xs cursor-pointer">
            <Filter className="w-4 h-4 text-gray-600" /> Filter Roles
          </button>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-wider text-gray-700 shadow-2xs">
          <UsersIcon className="w-4 h-4 text-gray-900" />
          {users.length} Total Users Registered
        </div>
      </div>

      {/* Customers Table - Universal Clean Screenshot Design */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-200/80 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="p-4 pl-6 font-semibold w-12"><input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" /></th>
                <th className="p-4 font-bold">USER & CONTACT</th>
                <th className="p-4 font-bold">ASSIGNED ROLE</th>
                <th className="p-4 font-bold">JOINED DATE</th>
                <th className="p-4 pr-6 font-bold text-right">ROLE MANAGEMENT</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-gray-500">
                    <Loader2 className="w-7 h-7 animate-spin text-gray-900 mx-auto mb-2" />
                    <span className="text-xs font-bold text-gray-700">Loading user registry...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-gray-400 italic">
                    No matching users found in registry.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 pl-6">
                      <input type="checkbox" className="rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer" />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-900 border border-gray-200 flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                          {user.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm leading-snug">{user.full_name || 'Anonymous User'}</p>
                          <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-gray-400" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize border ${
                        user.role === 'admin' ? 'bg-gray-900 text-white border-gray-900' :
                        user.role === 'manager' || user.role === 'editor' ? 'bg-gray-100 text-gray-900 border-gray-300' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {user.role === 'admin' ? <ShieldCheck className="w-3 h-3 text-white" /> : <UsersIcon className="w-3 h-3" />}
                        {user.role || 'user'}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-xs font-mono text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      {updatingId === user.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-900 inline-block" />
                      ) : (
                        <select 
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="bg-white border border-gray-200 text-gray-900 text-xs font-bold rounded-xl focus:ring-1 focus:ring-gray-900 focus:border-gray-900 py-1.5 px-3 outline-none shadow-2xs cursor-pointer ml-auto transition-all hover:border-gray-900"
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
