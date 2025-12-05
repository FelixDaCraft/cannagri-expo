import nodemailer from 'nodemailer'
import { siteConfig } from '@/config/site'

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface SendTicketEmailOptions {
  to: string
  customerName: string
  orderNumber: string
  pdfBuffer?: Buffer
  isStandBooking?: boolean
  standCodes?: string[]
}

/**
 * Send ticket email with PDF attachment
 */
export async function sendTicketEmail(options: SendTicketEmailOptions): Promise<void> {
  const { to, customerName, orderNumber, pdfBuffer, isStandBooking, standCodes } = options

  const subject = isStandBooking
    ? `Confirmation de réservation - Stand ${standCodes?.join(', ')} - ${siteConfig.name}`
    : `Votre e-billet - ${siteConfig.name}`

  const html = isStandBooking
    ? generateStandConfirmationHTML(customerName, orderNumber, standCodes || [])
    : generateTicketEmailHTML(customerName, orderNumber)

  const attachments = pdfBuffer
    ? [
        {
          filename: `billet-${orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ]
    : []

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    })

    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

function generateTicketEmailHTML(customerName: string, orderNumber: string): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Votre e-billet</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4F1E8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <tr>
          <td style="background-color: #2E4A33; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
            <p style="color: #A4B494; margin: 10px 0 0 0;">E-BILLET</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #2E4A33; margin: 0 0 20px 0;">Bonjour ${customerName},</h2>

            <p style="color: #333333; line-height: 1.6;">
              Merci pour votre commande ! Votre e-billet pour <strong>${siteConfig.name}</strong> est en pièce jointe de cet email.
            </p>

            <div style="background-color: #F4F1E8; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #666666;">N° de commande</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #2E4A33;">${orderNumber}</p>
            </div>

            <h3 style="color: #2E4A33; margin: 30px 0 15px 0;">Informations pratiques</h3>

            <table cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1;">
                  <strong>Date</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1; text-align: right;">
                  ${siteConfig.event.date}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1;">
                  <strong>Lieu</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1; text-align: right;">
                  ${siteConfig.event.location}, ${siteConfig.event.city}
                </td>
              </tr>
            </table>

            <div style="background-color: #A4B494; color: #2E4A33; padding: 15px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <strong>Important :</strong> Présentez votre e-billet (imprimé ou sur smartphone) à l'entrée du salon.
            </div>

            <p style="color: #666666; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${siteConfig.contact.email}" style="color: #2E4A33;">${siteConfig.contact.email}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #2E4A33; padding: 20px 30px; text-align: center;">
            <p style="color: #A4B494; margin: 0; font-size: 12px;">
              ${siteConfig.name} - ${siteConfig.event.year}<br>
              ${siteConfig.contact.email}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generateStandConfirmationHTML(customerName: string, orderNumber: string, standCodes: string[]): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de réservation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4F1E8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <tr>
          <td style="background-color: #2E4A33; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
            <p style="color: #A4B494; margin: 10px 0 0 0;">CONFIRMATION DE RÉSERVATION</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #2E4A33; margin: 0 0 20px 0;">Bonjour ${customerName},</h2>

            <p style="color: #333333; line-height: 1.6;">
              Nous avons le plaisir de vous confirmer la réservation de votre stand pour <strong>${siteConfig.name}</strong>.
            </p>

            <div style="background-color: #F4F1E8; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #666666;">Stand(s) réservé(s)</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #2E4A33;">${standCodes.join(', ')}</p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px;">N° de commande : ${orderNumber}</p>
            </div>

            <h3 style="color: #2E4A33; margin: 30px 0 15px 0;">Prochaines étapes</h3>

            <ol style="color: #333333; line-height: 1.8; padding-left: 20px;">
              <li>Vous recevrez votre facture par email sous 48h.</li>
              <li>Un guide de l'exposant vous sera envoyé 1 mois avant l'événement.</li>
              <li>Votre badge exposant sera disponible à l'accueil le jour J.</li>
            </ol>

            <p style="color: #666666; font-size: 14px; margin-top: 30px;">
              Pour toute question concernant votre stand, contactez-nous à <a href="mailto:${siteConfig.contact.email}" style="color: #2E4A33;">${siteConfig.contact.email}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #2E4A33; padding: 20px 30px; text-align: center;">
            <p style="color: #A4B494; margin: 0; font-size: 12px;">
              ${siteConfig.name} - ${siteConfig.event.year}<br>
              ${siteConfig.contact.email}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * Send newsletter subscription confirmation
 */
export async function sendNewsletterConfirmation(email: string): Promise<void> {
  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Bienvenue dans la newsletter ${siteConfig.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2E4A33;">Merci pour votre inscription !</h1>
        <p>Vous êtes maintenant inscrit à la newsletter ${siteConfig.name}.</p>
        <p>Vous recevrez en avant-première :</p>
        <ul>
          <li>Les actualités du salon</li>
          <li>Les annonces des exposants</li>
          <li>Les informations sur le programme</li>
        </ul>
        <p>À très bientôt !</p>
        <p style="color: #A4B494;">L'équipe ${siteConfig.name}</p>
      </div>
    `,
  })
}
