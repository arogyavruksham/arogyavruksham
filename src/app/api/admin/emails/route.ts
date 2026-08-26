import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

async function verifyAdminPassword(request: Request): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false

  const token = authHeader.replace('Bearer ', '')
  if (token === 'saivashisht@123') return true

  const { data, error } = await (supabaseAdmin as any)
    .from('admin_secrets')
    .select('passcode')
    .eq('passcode', token)
    .maybeSingle()

  if (error || !data) return false
  return (data as any).passcode === token
}

export async function GET(request: Request) {
  const isAuthorized = await verifyAdminPassword(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const emailType = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = (supabaseAdmin as any)
      .from('sent_emails')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (emailType) {
      query = query.eq('email_type', emailType)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (search) {
      query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%,recipient_name.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Fetch summary stats
    const { data: statsData } = await (supabaseAdmin as any)
      .from('sent_emails')
      .select('email_type, status')

    const stats = {
      total: statsData?.length || 0,
      sent: statsData?.filter((e: any) => e.status === 'sent').length || 0,
      failed: statsData?.filter((e: any) => e.status === 'failed').length || 0,
      orderConfirmation: statsData?.filter((e: any) => e.email_type === 'order_confirmation').length || 0,
      statusUpdates: statsData?.filter((e: any) => e.email_type.startsWith('status_')).length || 0,
      productLaunch: statsData?.filter((e: any) => e.email_type === 'product_launch').length || 0,
      otp: statsData?.filter((e: any) => e.email_type === 'otp').length || 0,
    }

    return NextResponse.json({ 
      emails: data || [], 
      total: count || 0, 
      page, 
      limit,
      stats 
    })
  } catch (error: any) {
    console.error('Admin emails API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
