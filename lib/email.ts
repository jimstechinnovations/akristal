import nodemailer from 'nodemailer'
import { formatCurrency } from './utils'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.zoho.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.BUSINESS_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Akristal Group Limited" <${process.env.BUSINESS_EMAIL || 'info@akristal.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email sending failed:', error)
    return { success: false, error }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Akristal Group Limited',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Akristal Group Limited</h1>
        <p>Hello ${name},</p>
        <p>Thank you for joining our real estate marketplace. We're excited to have you on board!</p>
        <p>You can now browse properties, save favorites, and connect with sellers and agents.</p>
        <p>If you have any questions, feel free to contact us at info@akristal.com or call us at +250791900316.</p>
        <p>Best regards,<br>Akristal Group Limited</p>
      </div>
    `,
  })
}

export async function sendListingApprovalEmail(
  email: string,
  name: string,
  propertyTitle: string,
  approved: boolean,
  reason?: string
) {
  return sendEmail({
    to: email,
    subject: `Your listing "${propertyTitle}" has been ${approved ? 'approved' : 'rejected'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Listing ${approved ? 'Approved' : 'Rejected'}</h1>
        <p>Hello ${name},</p>
        <p>Your property listing "${propertyTitle}" has been ${approved ? 'approved and is now live on our platform' : 'rejected'}.</p>
        ${!approved && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>If you have any questions, please contact us at info@akristal.com.</p>
        <p>Best regards,<br>Akristal Group Limited</p>
      </div>
    `,
  })
}

export async function sendMessageNotificationEmail(
  email: string,
  name: string,
  senderName: string,
  propertyTitle: string,
  messagePreview: string
) {
  return sendEmail({
    to: email,
    subject: `New message about ${propertyTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">New Message</h1>
        <p>Hello ${name},</p>
        <p>You have received a new message from ${senderName} regarding "${propertyTitle}".</p>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 5px;">${messagePreview}</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/messages" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Message</a></p>
        <p>Best regards,<br>Akristal Group Limited</p>
      </div>
    `,
  })
}

export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: number,
  currency: string,
  propertyTitle?: string
) {
  return sendEmail({
    to: email,
    subject: 'Payment Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Payment Confirmation</h1>
        <p>Hello ${name},</p>
        <p>We have received your payment of ${formatCurrency(amount, currency)}.</p>
        ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ''}
        <p>Your payment is being processed and you will receive an update once it's completed.</p>
        <p>If you have any questions, please contact us at info@akristal.com.</p>
        <p>Best regards,<br>Akristal Group Limited</p>
      </div>
    `,
  })
}


