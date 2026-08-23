import nodemailer from 'nodemailer'
import React from 'react'
import { render } from '@react-email/render'
import { OrderConfirmation } from './email/templates/OrderConfirmation'
import { OrderStatusUpdate } from './email/templates/OrderStatusUpdate'
import { ProductLaunch } from './email/templates/ProductLaunch'
import { BaseLayout } from './email/templates/BaseLayout'

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

export async function sendOrderConfirmationEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  pdfBuffer: Buffer,
  items: { name: string; quantity: number; price: string, imageUrl?: string }[] = []
) {
  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  const htmlContent = await render(
    <OrderConfirmation 
      order={{
        id: orderId,
        customerName,
        customerEmail: toEmail,
        items,
        totalAmount
      }} 
    />
  )

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `Order Confirmation - #${shortOrderId} | Arogyavruksham`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice_${shortOrderId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    })
    return true
  } catch (error) {
    console.error('Error sending order confirmation email via Nodemailer:', error)
    return false
  }
}

export async function sendShippingUpdateEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string
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
        storeUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.com'
      }} 
    />
  )

  let subjectMessage = `Update on your Arogyavruksham order #${shortOrderId}`
  if (newStatus === 'packed') subjectMessage = `Your Arogyavruksham order #${shortOrderId} is packed!`
  if (newStatus === 'shipped') subjectMessage = `Your Arogyavruksham order #${shortOrderId} has shipped!`
  if (newStatus === 'out_for_delivery') subjectMessage = `Your Arogyavruksham order #${shortOrderId} is out for delivery!`
  if (newStatus === 'delivered') subjectMessage = `Your Arogyavruksham order #${shortOrderId} has been delivered!`

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: subjectMessage,
      html: htmlContent,
    })
    return true
  } catch (error) {
    console.error('Error sending shipping update email via Nodemailer:', error)
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

  try {
    await transporter.sendMail({
      from: EMAIL_FROM,
      to: toEmail,
      subject: `Your Arogyavruksham Login Code: ${otpCode}`,
      html: htmlContent,
    })
    return { success: true, message: 'OTP sent successfully via Nodemailer' }
  } catch (error: any) {
    console.error('Error sending verification OTP email via Nodemailer:', error)
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
  
  const transporter = getTransporter()
  const storeUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arogyavruksham.com'
  
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

  try {
    const chunkSize = 10;
    for (let i = 0; i < toEmails.length; i += chunkSize) {
      const chunk = toEmails.slice(i, i + chunkSize);
      await Promise.all(chunk.map(email => 
        transporter.sendMail({
          from: EMAIL_FROM,
          to: email,
          subject: `New Arrival at Arogyavruksham: ${title}`,
          html: htmlContent,
        })
      ));
    }
    return true
  } catch (error) {
    console.error('Error sending product launch emails:', error)
    return false
  }
}
