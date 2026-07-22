import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyAdminPassword(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  if (token === 'saivashisht@123') return true

  // Check against DB
  const { data, error } = await (supabaseAdmin as any)
    .from('admin_secrets')
    .select('passcode')
    .eq('passcode', token)
    .maybeSingle()

  if (error || !data) return false
  return (data as any).passcode === token
}

export async function POST(request: Request) {
  const isAuthorized = await verifyAdminPassword(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { action, table, data, match, select, order } = await request.json()

    if (!table || !action) {
      return NextResponse.json({ error: 'Missing table or action' }, { status: 400 })
    }

    let query: any = supabaseAdmin.from(table)
    let result: any = null

    switch (action) {
      case 'select':
        query = query.select(select || '*')
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value)
          }
        }
        if (order) {
          query = query.order(order.column, { ascending: order.ascending })
        }
        result = await query
        break
      case 'insert':
        result = await query.insert(data).select()
        break
      case 'update':
        query = query.update(data)
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value)
          }
        } else {
          return NextResponse.json({ error: 'Update requires a match condition' }, { status: 400 })
        }
        result = await query.select()
        break
      case 'delete':
        query = query.delete()
        if (match) {
          for (const [key, value] of Object.entries(match)) {
            query = query.eq(key, value)
          }
        } else {
          return NextResponse.json({ error: 'Delete requires a match condition' }, { status: 400 })
        }
        result = await query
        break
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    if (result.error) {
      console.error(`[DB Proxy] ${action} error on ${table}:`, result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ data: result.data || [] })
  } catch (err: any) {
    console.error('[DB Proxy] catch block error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
