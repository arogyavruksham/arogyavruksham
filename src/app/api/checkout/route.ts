import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'
import { sendOrderConfirmationEmail } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    const { userId, total, items, addressData, appliedCoupon, discountAmount, paymentMethod } = await request.json()

    if (!userId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid checkout data' }, { status: 400 })
    }

    if (appliedCoupon && appliedCoupon.code) {
      const { data: couponData, error: couponError } = await (supabaseAdmin as any)
        .from('coupons')
        .select('*')
        .eq('code', appliedCoupon.code)
        .eq('is_active', true)
        .single()

      if (couponError || !couponData) {
        return NextResponse.json({ error: 'Applied coupon is invalid or no longer active.' }, { status: 400 })
      }
      const now = Date.now()
      const start = new Date(couponData.start_date).getTime()
      const end = new Date(couponData.expiry_date).getTime()
      if (now < start || now > end) {
        return NextResponse.json({ error: 'Applied coupon has expired or is not active yet.' }, { status: 400 })
      }
    }

    // 1. Create the Order
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .insert({
        user_id: userId,
        total_amount: total,
        status: paymentMethod === 'online' ? 'paid' : 'pending',
        shipping_address: addressData,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        discount_amount: discountAmount,
        payment_method: paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery'
      })
      .select()
      .single()

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`)

    // 2. Fetch actual prices and create Order Items
    const productIds = items.map((item: any) => item.id)
    const { data: productsData, error: productsError } = await (supabaseAdmin as any)
      .from('products')
      .select('id, actual_price, stock_count')
      .in('id', productIds)

    if (productsError) throw new Error(`Failed to fetch products: ${productsError.message}`)

    const productMap = new Map()
    if (productsData) {
      productsData.forEach((p: any) => productMap.set(p.id, p))
    }

    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      price_at_time: item.price,
      actual_price_at_time: productMap.get(item.id)?.actual_price || 0
    }))

    const { error: itemsError } = await (supabaseAdmin as any).from('order_items').insert(orderItems)
    if (itemsError) throw new Error(`Failed to create order items: ${itemsError.message}`)

    // 3. Decrement Stock manually using Supabase Admin
    for (const item of items) {
      const product = productMap.get(item.id)
      if (product) {
        const newStock = Math.max(0, (product.stock_count || 0) - item.quantity)
        const { error: stockError } = await (supabaseAdmin as any)
          .from('products')
          .update({ stock_count: newStock })
          .eq('id', item.id)
          
        if (stockError) console.error(`Failed to decrement stock for ${item.id}:`, stockError)
      }
    }

    // 4. Generate Invoice and Send Email
    try {
      // Get the customer email
      const { data: userData } = await (supabaseAdmin as any)
        .from('users')
        .select('email, full_name')
        .eq('id', userId)
        .single()
      
      const customerEmail = userData?.email || addressData?.email
      const customerName = addressData?.name || userData?.full_name || 'Customer'

      if (customerEmail) {
        // We pass the order and the orderItems to generate the PDF
        const pdfBuffer = await generateInvoicePDF(order, orderItems)
        
        // Send the email asynchronously without awaiting it strictly to avoid blocking the checkout response
        // though awaiting is safer for serverless to ensure it finishes before exiting
        await sendOrderConfirmationEmail(
          customerEmail,
          customerName,
          order.id,
          order.total_amount,
          pdfBuffer
        )
      }
    } catch (emailError: any) {
      console.error('Failed to send order confirmation email:', emailError)
      require('fs').appendFileSync('email-error.log', new Date().toISOString() + ': ' + (emailError?.stack || emailError?.message || emailError) + '\n')
      // We don't throw here because the order was already successfully created
    }

    return NextResponse.json({ success: true, orderId: order.id })
    
  } catch (error: any) {
    console.error('Checkout API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
