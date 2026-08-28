import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { sendShippingUpdateEmail, resolveCustomerEmail, fetchRecommendedProducts } from '@/lib/emailService'
import { revalidatePath } from 'next/cache'

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

function computeDerivedStatus(order: any): string {
  const now = new Date()
  const orderDate = new Date(order.created_at)
  const expectedDelivery = order.expected_delivery_date ? new Date(order.expected_delivery_date) : new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000)
  const daysSinceOrder = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  const isDelayed = order.status !== 'delivered' && now > expectedDelivery

  if (order.status === 'delivered') return 'delivered'
  if (order.status === 'shipped' || order.status === 'out_for_delivery') return isDelayed ? 'delayed' : 'shipping'
  if (order.status === 'pending' || order.status === 'paid' || order.status === 'packed') return isDelayed ? 'delayed' : 'processing'
  if (order.status === 'cancelled') return 'cancelled'
  return isDelayed ? 'delayed' : 'processing'
}

function getDaysSinceOrder(createdAt: string): number {
  const now = new Date()
  const orderDate = new Date(createdAt)
  return Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
}

function getExpectedDeliveryDate(createdAt: string, expectedDeliveryDate?: string): Date {
  if (expectedDeliveryDate) return new Date(expectedDeliveryDate)
  const orderDate = new Date(createdAt)
  return new Date(orderDate.getTime() + 3 * 24 * 60 * 60 * 1000)
}

function isOrderDelayed(order: any): boolean {
  const derivedStatus = computeDerivedStatus(order)
  return derivedStatus === 'delayed'
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

  // Enrich orders with computed fields
  const enrichedOrders = (data || []).map((order: any) => {
    const derivedStatus = computeDerivedStatus(order)
    const daysSinceOrder = getDaysSinceOrder(order.created_at)
    const expectedDelivery = getExpectedDeliveryDate(order.created_at, order.expected_delivery_date)
    const isDelayed = isOrderDelayed(order)
    const daysOverdue = isDelayed ? Math.floor((new Date().getTime() - expectedDelivery.getTime()) / (1000 * 60 * 60 * 24)) : 0

    return {
      ...order,
      derived_status: derivedStatus,
      days_since_order: daysSinceOrder,
      expected_delivery_date: expectedDelivery.toISOString().split('T')[0],
      expected_delivery_display: expectedDelivery.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      is_delayed: isDelayed,
      days_overdue: daysOverdue,
      is_not_seen: !order.admin_viewed && order.status !== 'delivered' && order.status !== 'cancelled',
      last_updated: order.updated_at || order.created_at,
      last_updated_display: (order.updated_at || order.created_at) ? new Date(order.updated_at || order.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A',
    }
  })

  return NextResponse.json(enrichedOrders)
}

export async function PATCH(request: Request) {
  const isAuthorized = await verifyAdminPassword(request)
  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { orderId, newStatus, markAsViewed, trackingNumber, shippingCarrier } = body
    
    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    // Build update object
    const updateData: any = { updated_at: new Date().toISOString() }
    
    if (newStatus) {
      updateData.status = newStatus
      
      // Set timestamps based on status change
      if (newStatus === 'shipped' || newStatus === 'out_for_delivery') {
        updateData.shipped_at = new Date().toISOString()
        if (trackingNumber) updateData.tracking_number = trackingNumber
        if (shippingCarrier) updateData.shipping_carrier = shippingCarrier
      }
      if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString()
      }
    }
    
    if (markAsViewed === true) {
      updateData.admin_viewed = true
    }

    const { error } = await (supabaseAdmin as any)
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      console.error("Supabase update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status changed, send email notification
    if (newStatus) {
      try {
        const { data: orderData } = await (supabaseAdmin as any)
          .from('orders')
          .select(`
            total_amount,
            shipping_address,
            users (
              email,
              full_name
            ),
            order_items (
              quantity,
              price_at_time,
              product_id,
              products (
                title,
                image_url
              )
            )
          `)
          .eq('id', orderId)
          .single()

        if (orderData) {
          const customerEmail = resolveCustomerEmail(
            orderData.users?.email,
            orderData.shipping_address?.email
          )
          const customerName = orderData.shipping_address?.name || orderData.users?.full_name || 'Customer'
          
          const items = orderData.order_items?.map((item: any) => ({
            name: item.products?.title || 'Product',
            quantity: item.quantity,
            price: `₹${item.price_at_time.toLocaleString('en-IN')}`,
            imageUrl: item.products?.image_url || '',
            productId: item.product_id || '',
          })) || []

          const addr = orderData.shipping_address
          const deliveryAddressStr = addr 
            ? [addr.fullAddress, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')
            : ''

          if (customerEmail) {
            const orderedProductIds = orderData.order_items?.map((item: any) => item.product_id).filter(Boolean) || []
            const recommendedProducts = await fetchRecommendedProducts(orderedProductIds, 4)

            await sendShippingUpdateEmail(
              customerEmail,
              customerName,
              orderId,
              newStatus,
              orderData.total_amount,
              items,
              deliveryAddressStr,
              recommendedProducts
            )
          }
        }
      } catch (emailError) {
        console.error("Failed to send shipping update email:", emailError)
      }
    }

    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PATCH catch block error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
