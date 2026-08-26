import nodemailer from 'nodemailer'
import React from 'react'
import { render } from '@react-email/render'
import { OrderConfirmation } from './email/templates/OrderConfirmation'
import { OrderStatusUpdate } from './email/templates/OrderStatusUpdate'
import { ProductLaunch } from './email/templates/ProductLaunch'
import { BaseLayout } from './email/templates/BaseLayout'
import type { RecommendedProduct } from './email/templates/OrderConfirmation'
import { supabaseAdmin } from './supabase-admin'

const EMAIL_USER = (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'placeholder@example.com') 
  ? process.env.EMAIL_USER 
  : 'arogyavruksham@gmail.com'

const rawAppPassword = (process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD !== 'placeholder_password') 
  ? process.env.EMAIL_APP_PASSWORD 
  : 'hkvkbqftvtljbacy'

const EMAIL_APP_PASSWORD = rawAppPassword.replace(/\s+/g, '')
const EMAIL_FROM = process.env.EMAIL_FROM || `Arogyavruksham <${EMAIL_USER}>`

const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  })
}

// ─── Helpers ────────────────────────────────────────────────

/**
 * Resolves a real customer email. Skips synthetic @arogya.auth.local addresses.
 * Priority: addressEmail > userEmail
 */
export function resolveCustomerEmail(userEmail?: string | null, addressEmail?: string | null): string | null {
  // Check address email first (from order form)
  if (addressEmail && !addressEmail.endsWith('@arogya.auth.local') && addressEmail.includes('@')) {
    return addressEmail
  }
  // Then check user email
  if (userEmail && !userEmail.endsWith('@arogya.auth.local') && userEmail.includes('@')) {
    return userEmail
  }
  return null
}

/**
 * Logs a sent email record to the `sent_emails` table in Supabase.
 */
async function logSentEmail(params: {
  orderId?: string | null
  recipientEmail: string
  recipientName?: string
  emailType: string
  subject: string
  status: 'sent' | 'failed'
  errorMessage?: string
  metadata?: Record<string, any>
  htmlPreview?: string
}) {
  try {
    await (supabaseAdmin as any).from('sent_emails').insert({
      order_id: params.orderId || null,
      recipient_email: params.recipientEmail,
      recipient_name: params.recipientName || null,
      email_type: params.emailType,
      subject: params.subject,
      status: params.status,
      error_message: params.errorMessage || null,
      metadata: params.metadata || {},
      html_preview: params.htmlPreview ? params.htmlPreview.substring(0, 500) : null,
    })
  } catch (err) {
    console.error('Failed to log sent email:', err)
  }
}

/**
 * Fetches random recommended products from the store, excluding given product IDs.
 */
export async function fetchRecommendedProducts(excludeIds: string[] = [], limit: number = 4): Promise<RecommendedProduct[]> {
  try {
    // Fetch a larger set and pick random ones
    const { data, error } = await (supabaseAdmin as any)
      .from('products')
      .select('id, title, price, image_url')
      .eq('is_active', true)
      .limit(20)

    if (error || !data || data.length === 0) return []

    // Filter out excluded products
    const filtered = data.filter((p: any) => !excludeIds.includes(p.id) && p.image_url)
    
    // Shuffle and take `limit`
    const shuffled = filtered.sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit).map((p: any) => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image_url: p.image_url,
    }))
  } catch (err) {
    console.error('Failed to fetch recommended products:', err)
    return []
  }
}


// ─── Email Send Functions ───────────────────────────────────

export async function sendOrderConfirmationEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  pdfBuffer: Buffer,
  items: { name: string; quantity: number; price: string; imageUrl?: string; productId?: string }[] = [],
  options?: {
    shippingCost?: number
    discountAmount?: number
    couponCode?: string
    deliveryAddress?: string
    paymentMethod?: string
    recommendedProducts?: RecommendedProduct[]
  }
) {
  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()
  const subject = `Order Confirmed — #${shortOrderId} | Arogyavruksham`

  const htmlContent = await render(
    <OrderConfirmation 
      order={{
        id: orderId,
        customerName,
        customerEmail: toEmail,
        items,
        totalAmount,
        shippingCost: options?.shippingCost,
        discountAmount: options?.discountAmount,
        couponCode: options?.couponCode,
        deliveryAddress: options?.deliveryAddress,
        paymentMethod: options?.paymentMethod,
        recommendedProducts: options?.recommendedProducts || [],
      }} 
    />
  )

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice_${shortOrderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
    
    await logSentEmail({
      orderId,
      recipientEmail: toEmail,
      recipientName: customerName,
      emailType: 'order_confirmation',
      subject,
      status: 'sent',
      metadata: {
        totalAmount,
        itemCount: items.length,
        items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
        paymentMethod: options?.paymentMethod || 'Online',
        hasInvoice: true,
      },
      htmlPreview: htmlContent,
    })

    return true
  } catch (error: any) {
    console.error('Error sending order confirmation email via Nodemailer:', error)
    
    await logSentEmail({
      orderId,
      recipientEmail: toEmail,
      recipientName: customerName,
      emailType: 'order_confirmation',
      subject,
      status: 'failed',
      errorMessage: error?.message || 'Unknown error',
      metadata: { totalAmount, itemCount: items.length },
    })

    return false
  }
}

export async function sendShippingUpdateEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string,
  totalAmount: number = 0,
  items: { name: string; quantity: number; price: string; imageUrl?: string; productId?: string }[] = [],
  deliveryAddress: string = '',
  recommendedProducts: RecommendedProduct[] = []
) {
  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  if (!['packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].includes(newStatus)) {
    return false
  }

  const htmlContent = await render(
    <OrderStatusUpdate 
      data={{
        orderId,
        customerName,
        status: newStatus,
        totalAmount,
        items,
        deliveryAddress,
        storeUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.vercel.app',
        recommendedProducts,
      }} 
    />
  )

  let subjectMessage = `Update on your Arogyavruksham order #${shortOrderId}`
  if (newStatus === 'packed') subjectMessage = `Your order #${shortOrderId} is packed! | Arogyavruksham`
  if (newStatus === 'shipped') subjectMessage = `Shipped: Order #${shortOrderId} is on the way! | Arogyavruksham`
  if (newStatus === 'out_for_delivery') subjectMessage = `Out for delivery: Order #${shortOrderId} | Arogyavruksham`
  if (newStatus === 'delivered') subjectMessage = `Delivered: Order #${shortOrderId} | Arogyavruksham`
  if (newStatus === 'cancelled') subjectMessage = `Cancelled: Order #${shortOrderId} | Arogyavruksham`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: subjectMessage,
      html: htmlContent,
    })

    await logSentEmail({
      orderId,
      recipientEmail: toEmail,
      recipientName: customerName,
      emailType: `status_${newStatus}`,
      subject: subjectMessage,
      status: 'sent',
      metadata: {
        newStatus,
        totalAmount,
        itemCount: items.length,
        items: items.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      },
      htmlPreview: htmlContent,
    })

    return true
  } catch (error: any) {
    console.error('Error sending shipping update email via Nodemailer:', error)

    await logSentEmail({
      orderId,
      recipientEmail: toEmail,
      recipientName: customerName,
      emailType: `status_${newStatus}`,
      subject: subjectMessage,
      status: 'failed',
      errorMessage: error?.message || 'Unknown error',
      metadata: { newStatus, totalAmount },
    })

    return false
  }
}

export async function sendVerificationOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; message: string }> {
  const transporter = getTransporter()

  const htmlContent = await render(
    <BaseLayout title={`Your Login Code: ${otpCode}`}>
      <h2 style={{ color: '#1E4631', fontSize: '22px', marginTop: '0', marginBottom: '24px' }}>
        Verification Code
      </h2>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '16px' }}>
        Hello,
      </p>
      <p style={{ fontSize: '15px', color: '#555', lineHeight: '1.6', marginBottom: '32px' }}>
        You requested a login code to access your Arogyavruksham account. Please enter the following 6-digit verification code:
      </p>
      
      <div style={{ backgroundColor: '#F0F7F2', border: '2px dashed #689F38', borderRadius: '12px', padding: '24px', textAlign: 'center', margin: '28px 0' }}>
        <span style={{ fontFamily: 'monospace', fontSize: '36px', fontWeight: 'bold', letterSpacing: '8px', color: '#1E4631' }}>
          {otpCode}
        </span>
      </div>
      
      <p style={{ fontSize: '13px', color: '#777', marginTop: '24px' }}>
        This security code will expire in 10 minutes. If you did not request this verification, simply ignore this email.
      </p>
    </BaseLayout>
  )

  const subject = `Your Arogyavruksham Login Code: ${otpCode}`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject,
      html: htmlContent,
    })

    await logSentEmail({
      recipientEmail: toEmail,
      emailType: 'otp',
      subject,
      status: 'sent',
      metadata: { otpCodeLength: otpCode.length },
    })

    return { success: true, message: 'OTP sent successfully via Nodemailer' }
  } catch (error: any) {
    console.error('Error sending verification OTP email via Nodemailer:', error)

    await logSentEmail({
      recipientEmail: toEmail,
      emailType: 'otp',
      subject,
      status: 'failed',
      errorMessage: error?.message || 'Unknown error',
    })

    return { success: false, message: error.message || 'Failed to send OTP email via Nodemailer' }
  }
}

export async function sendProductLaunchEmail(
  toEmails: string[],
  title: string,
  imageUrl: string,
  price: number,
  description: string,
  productId: string
) {
  if (toEmails.length === 0) return false;
  
  // Filter out synthetic emails
  const validEmails = toEmails.filter(email => !email.endsWith('@arogya.auth.local') && email.includes('@'))
  if (validEmails.length === 0) return false;

  const transporter = getTransporter()
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.vercel.app'
  
  const htmlContent = await render(
    <ProductLaunch 
      product={{
        title,
        imageUrl,
        price,
        description,
        url: `${storeUrl}/shop/${productId}`
      }} 
    />
  )

  const subject = `New Arrival at Arogyavruksham: ${title}`

  try {
    const chunkSize = 10;
    for (let i = 0; i < validEmails.length; i += chunkSize) {
      const chunk = validEmails.slice(i, i + chunkSize);
      await Promise.all(chunk.map(async (email) => {
        try {
          await transporter.sendMail({
            from: EMAIL_FROM,
            to: email,
            subject,
            html: htmlContent,
          })
          await logSentEmail({
            recipientEmail: email,
            emailType: 'product_launch',
            subject,
            status: 'sent',
            metadata: { productId, productTitle: title, price },
          })
        } catch (sendErr: any) {
          await logSentEmail({
            recipientEmail: email,
            emailType: 'product_launch',
            subject,
            status: 'failed',
            errorMessage: sendErr?.message || 'Unknown error',
            metadata: { productId, productTitle: title },
          })
        }
      }));
    }
    return true
  } catch (error) {
    console.error('Error sending product launch emails:', error)
    return false
  }
}
