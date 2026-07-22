import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { sendShippingUpdateEmail } from '@/lib/emailService'

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

export async function GET(request: Request) {
  const isAuthorized = await verifyAdminPassword(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await (supabaseAdmin as any)
    .from('orders')
    .select(`
      *,
      users (
        full_name,
        email
      ),
      order_items (
        quantity,
        price_at_time,
        products (
          title,
          image_url
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminPassword(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId, newStatus } = await request.json()
    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const { error } = await (supabaseAdmin as any)
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // After successful update, get the user's email to send the update
    try {
      const { data: orderData } = await (supabaseAdmin as any)
        .from('orders')
        .select(`
          shipping_address,
          users (
            email,
            full_name
          )
        `)
        .eq('id', orderId)
        .single()

      if (orderData) {
        const customerEmail = orderData.users?.email || orderData.shipping_address?.email
        const customerName = orderData.shipping_address?.name || orderData.users?.full_name || 'Customer'

        if (customerEmail) {
          await sendShippingUpdateEmail(
            customerEmail,
            customerName,
            orderId,
            newStatus
          )
        }
      }
    } catch (emailError) {
      console.error("Failed to send shipping update email:", emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PATCH catch block error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
