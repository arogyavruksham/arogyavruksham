import nodemailer from 'nodemailer'

const EMAIL_USER = (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'placeholder@example.com') 
  ? process.env.EMAIL_USER 
  : 'arogyavruksham@gmail.com'

const rawAppPassword = (process.env.EMAIL_APP_PASSWORD && process.env.EMAIL_APP_PASSWORD !== 'placeholder_password') 
  ? process.env.EMAIL_APP_PASSWORD 
  : 'hkvkbqftvtljbacy'

// Remove any whitespace from Gmail App Passwords to prevent SMTP authentication syntax issues
const EMAIL_APP_PASSWORD = rawAppPassword.replace(/\s+/g, '')

const EMAIL_FROM = process.env.EMAIL_FROM || `Arogyavruksham <${EMAIL_USER}>`

// Create a transporter using confirmed Gmail SMTP credentials
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
  pdfBuffer: Buffer
) {
  const transporter = getTransporter()
  const shortOrderId = orderId.split('-')[0].toUpperCase()

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #235839;">Order Confirmation</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your order! We have received it and are preparing your botanical items now.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #235839;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${shortOrderId}</p>
        <p style="margin: 5px 0 0 0;"><strong>Total Amount:</strong> ₹${totalAmount.toLocaleString('en-IN')}</p>
      </div>
      <p>Your official tax invoice is attached to this email as a PDF.</p>
      <p>We will notify you once your greenery has been dispatched!</p>
      <br />
      <p>Best regards,<br/><strong>${process.env.NEXT_PUBLIC_STORE_NAME || 'Team Arogyavruksham'}</strong></p>
    </div>
  `

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

  let statusMessage = ''
  let subjectMessage = ''

  switch (newStatus) {
    case 'packed':
      subjectMessage = `Your Arogyavruksham order #${shortOrderId} is packed!`
      statusMessage = 'Great news! Your plant items have been safely packed and are awaiting dispatch.'
      break
    case 'shipped':
      subjectMessage = `Your Arogyavruksham order #${shortOrderId} has shipped!`
      statusMessage = 'Your order is on its way! It has been handed over to our verified delivery partners.'
      break
    case 'out_for_delivery':
      subjectMessage = `Your Arogyavruksham order #${shortOrderId} is out for delivery!`
      statusMessage = 'Get ready! Your green sanctuary items are out for delivery and will arrive today.'
      break
    case 'delivered':
      subjectMessage = `Your Arogyavruksham order #${shortOrderId} has been delivered!`
      statusMessage = 'Your order has been safely delivered. We hope these beautiful additions bring fresh energy to your home!'
      break
    case 'cancelled':
      subjectMessage = `Update on your Arogyavruksham order #${shortOrderId}`
      statusMessage = 'Your order has been cancelled. If you have any questions, our support team is ready to assist you.'
      break
    default:
      return false // Don't send emails for other statuses (e.g. paid, pending)
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #235839;">Order Status Update</h2>
      <p>Hi ${customerName},</p>
      <p>${statusMessage}</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #235839;">
        <p style="margin: 0;"><strong>Order ID:</strong> #${shortOrderId}</p>
        <p style="margin: 5px 0 0 0; text-transform: capitalize;"><strong>Current Status:</strong> ${newStatus.replace(/_/g, ' ')}</p>
      </div>
      <p>Thank you for shopping with us!</p>
      <br />
      <p>Best regards,<br/><strong>${process.env.NEXT_PUBLIC_STORE_NAME || 'Team Arogyavruksham'}</strong></p>
    </div>
  `

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
      from: EMAIL_FROM,
      to: toEmail,
      subject: `Your Arogyavruksham Login Code: ${otpCode}`,
      html: htmlContent,
    })
    console.log(`[NODE EMAIL SENDER] Successfully dispatched OTP email to ${toEmail} via Nodemailer`)
    return { success: true, message: 'OTP sent successfully via Nodemailer' }
  } catch (error: any) {
    console.error('Error sending verification OTP email via Nodemailer:', error)
    return { success: false, message: error.message || 'Failed to send OTP email via Nodemailer' }
  }
}
