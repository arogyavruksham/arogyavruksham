import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { supabase } from '@/lib/supabase'
import { generateInvoicePDF } from '@/lib/invoiceGenerator'
import { sendOrderConfirmationEmail, resolveCustomerEmail, fetchRecommendedProducts } from '@/lib/emailService'

export async function POST(request: Request) {
  try {
    const { userId: clientUserId, userEmail, total, items, addressData, appliedCoupon, discountAmount, paymentMethod } = await request.json()

    let finalUserId = clientUserId;
    if (!finalUserId && userEmail) {
      const { data: userData } = await (supabaseAdmin as any)
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      if (userData?.id) {
        finalUserId = userData.id;
      }
    }

    if (!finalUserId || !items || items.length === 0) {
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
      if (couponData.usage_limit !== null && couponData.usage_count >= couponData.usage_limit) {
        return NextResponse.json({ error: 'Applied coupon has reached its usage limit.' }, { status: 400 })
      }
    }

    // 1. Create the Order
    const { data: order, error: orderError } = await (supabaseAdmin as any)
      .from('orders')
      .insert({
        user_id: finalUserId,
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

    // 2.5 Increment coupon usage count
    if (appliedCoupon && appliedCoupon.code) {
      const { error: couponErr } = await (supabaseAdmin as any).rpc('increment_coupon_usage', { p_code: appliedCoupon.code })
      if (couponErr) console.error("Failed to increment coupon usage", couponErr);
    }

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
      // Get the customer email from users table
      const { data: userData } = await (supabaseAdmin as any)
        .from('users')
        .select('email, full_name')
        .eq('id', finalUserId)
        .single()
      
      // Smart email resolution: address form email > user email, skip @arogya.auth.local
      const customerEmail = resolveCustomerEmail(userData?.email, addressData?.email)
      const customerName = addressData?.name || userData?.full_name || 'Customer'

      if (customerEmail) {
        // Also update the user's email in Supabase if they had a synthetic one
        if (userData?.email?.endsWith('@arogya.auth.local') && addressData?.email && !addressData.email.endsWith('@arogya.auth.local')) {
          await (supabaseAdmin as any)
            .from('users')
            .update({ email: addressData.email })
            .eq('id', finalUserId)
        }

        // Generate the PDF invoice
        const pdfBuffer = await generateInvoicePDF(order, orderItems)
        
        // Fetch recommended products (exclude items in this order)
        const orderedProductIds = items.map((i: any) => i.id)
        const recommendedProducts = await fetchRecommendedProducts(orderedProductIds, 4)

        // Build delivery address string
        const deliveryAddressStr = addressData 
          ? [addressData.fullAddress, addressData.city, addressData.state, addressData.pincode].filter(Boolean).join(', ')
          : ''

        // Calculate shipping
        const subtotal = items.reduce((t: number, i: any) => t + i.price * i.quantity, 0)
        const shippingCost = subtotal > 20000 ? 0 : 500

        // Send the email
        await sendOrderConfirmationEmail(
          customerEmail,
          customerName,
          order.id,
          order.total_amount,
          pdfBuffer,
          items.map((i: any) => ({
            name: i.title,
            quantity: i.quantity,
            price: `₹${i.price.toLocaleString('en-IN')}`,
            imageUrl: i.imageUrl || '',
            productId: i.id || '',
          })),
          {
            shippingCost,
            discountAmount: discountAmount || 0,
            couponCode: appliedCoupon?.code || '',
            deliveryAddress: deliveryAddressStr,
            paymentMethod: paymentMethod === 'online' ? 'Online Payment' : 'Cash on Delivery',
            recommendedProducts,
          }
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
