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
