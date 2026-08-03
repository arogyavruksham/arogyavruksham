import nodemailer from 'nodemailer'

// Create a transporter using environment variables
// It assumes Gmail but can be configured for any SMTP
const getTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

export async function sendOrderConfirmationEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  pdfBuffer: Buffer
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email credentials not set, skipping order confirmation email')
    return false
  }

  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1A73E8;">Order Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order! We have received it and are processing it now.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${shortOrderId}</p>
        <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
      </div>
      <p>Your official invoice is attached to this email as a PDF.</p>
      <p>We will notify you once your order has been shipped!</p>
      <br />
      <p>Best regards,<br/><strong>${process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'}</strong></p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: `Order Confirmation - #${shortOrderId}`,
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
    console.error('Error sending order confirmation email:', error)
    return false
  }
}

export async function sendShippingUpdateEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  newStatus: string
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email credentials not set, skipping shipping update email')
    return false
  }

  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  let statusMessage = ''
  let subjectMessage = ''

  switch (newStatus) {
    case 'packed':
      subjectMessage = `Your order #${shortOrderId} is packed!`
      statusMessage = 'Great news! Your order has been packed and is getting ready to be shipped.'
      break
    case 'shipped':
      subjectMessage = `Your order #${shortOrderId} has shipped!`
      statusMessage = 'Your order is on its way. It has been handed over to our delivery partners.'
      break
    case 'out_for_delivery':
      subjectMessage = `Your order #${shortOrderId} is out for delivery!`
      statusMessage = 'Get ready! Your order is out for delivery and should arrive today.'
      break
    case 'delivered':
      subjectMessage = `Your order #${shortOrderId} has been delivered!`
      statusMessage = 'Your order has been marked as delivered. We hope you enjoy your purchase!'
      break
    case 'cancelled':
      subjectMessage = `Update on your order #${shortOrderId}`
      statusMessage = 'Your order has been cancelled. If you have any questions, please contact our support.'
      break
    default:
      return false // Don't send emails for other statuses (e.g. paid, pending)
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #1A73E8;">Order Update</h2>
      <p>Hi ${customerName},</p>
      <p>${statusMessage}</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${shortOrderId}</p>
        <p style="margin: 5px 0 0 0; text-transform: capitalize;"><strong>Status:</strong> ${newStatus.replace(/_/g, ' ')}</p>
      </div>
      <p>Thank you for shopping with us!</p>
      <br />
      <p>Best regards,<br/><strong>${process.env.NEXT_PUBLIC_STORE_NAME || 'Our Store'}</strong></p>
    </div>
  `

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: toEmail,
      subject: subjectMessage,
      html: htmlContent,
    })
    return true
  } catch (error) {
    console.error('Error sending shipping update email:', error)
    return false
  }
}

export async function sendVerificationOtpEmail(toEmail: string, otpCode: string): Promise<{ success: boolean; message: string }> {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('EMAIL_USER or EMAIL_APP_PASSWORD not configured in environment variables. Simulated email sent with OTP:', otpCode)
    return { success: true, message: 'Simulated email sent (EMAIL_USER not configured)' }
  }

  const transporter = getTransporter()

  const htmlContent = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-w: 580px; margin: 0 auto; background-color: #FAFAF7; border: 1px solid #EAEAE3; border-radius: 16px; overflow: hidden;">
      <div style="background-color: #235839; padding: 28px 24px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: 0.5px;">Arogyavruksham</h1>
        <p style="color: #A3D4B5; font-size: 13px; margin: 6px 0 0 0; font-style: italic;">Your Authentic Botanical & Green Living Sanctuary</p>
      </div>
      <div style="padding: 36px 32px; background-color: #FFFFFF; color: #333333;">
        <h2 style="font-size: 20px; color: #1E4631; margin-top: 0;">Verification Code</h2>
        <p style="font-size: 15px; color: #555555; line-height: 1.6;">Hello,</p>
        <p style="font-size: 15px; color: #555555; line-height: 1.6;">You requested a login code to access your Arogyavruksham account. Please enter the following 6-digit verification code:</p>
        
        <div style="background-color: #F0F7F2; border: 2px dashed #689F38; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
          <span style="font-family: monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1E4631;">${otpCode}</span>
        </div>
        
        <p style="font-size: 13px; color: #777777; margin-top: 24px;">This security code will expire in 10 minutes. If you did not request this verification, simply ignore this email.</p>
        <p style="font-size: 15px; color: #333333; margin: 30px 0 0 0;">Warm regards,<br/><strong style="color: #235839;">Team Arogyavruksham</strong></p>
      </div>
      <div style="background-color: #FAFAF7; padding: 18px 24px; text-align: center; font-size: 11px; color: #888888; border-top: 1px solid #EAEAE3;">
        &copy; ${new Date().getFullYear()} Arogyavruksham. All rights reserved.
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `"${process.env.NEXT_PUBLIC_STORE_NAME || 'Arogyavruksham'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
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

