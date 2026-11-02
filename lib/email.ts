import nodemailer from 'nodemailer'
import { siteConfig } from '@/config/site'
import type { EditionSummary } from '@/lib/editions/format'

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

interface TicketAttachment {
  attendeeName: string
  ticketType: string
  pdfBuffer: Buffer
}

interface SendTicketEmailOptions {
  to: string
  customerName: string
  orderNumber: string
  pdfBuffer?: Buffer
  tickets?: TicketAttachment[]
  isStandBooking?: boolean
  standCodes?: string[]
  invoicePdfBuffer?: Buffer // Invoice PDF attachment
  edition: EditionSummary // Édition concernée par la commande
}

/**
 * Send ticket email with PDF attachment(s)
 */
export async function sendTicketEmail(options: SendTicketEmailOptions): Promise<void> {
  const { to, customerName, orderNumber, pdfBuffer, tickets, isStandBooking, standCodes, invoicePdfBuffer, edition } = options

  const ticketCount = tickets?.length || (pdfBuffer ? 1 : 0)

  const subject = isStandBooking
    ? `Confirmation de réservation - Stand ${standCodes?.join(', ')} - ${siteConfig.name}`
    : ticketCount > 1
    ? `Vos ${ticketCount} e-billets - ${siteConfig.name}`
    : `Votre e-billet - ${siteConfig.name}`

  const hasInvoice = !!invoicePdfBuffer
  const html = isStandBooking
    ? generateStandConfirmationHTML(customerName, orderNumber, standCodes || [], edition, hasInvoice)
    : generateTicketEmailHTML(customerName, orderNumber, tickets, edition, hasInvoice)

  // Build attachments array
  let attachments: Array<{ filename: string; content: Buffer; contentType: string }> = []

  if (tickets && tickets.length > 0) {
    // Multiple tickets with individual attendee names
    attachments = tickets.map((ticket, index) => ({
      filename: `billet-${orderNumber}-${ticket.attendeeName.replace(/\s+/g, '-')}.pdf`,
      content: ticket.pdfBuffer,
      contentType: 'application/pdf',
    }))
  } else if (pdfBuffer) {
    // Single ticket (legacy support)
    attachments = [
      {
        filename: `billet-${orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ]
  }

  // Add invoice PDF if provided
  if (invoicePdfBuffer) {
    attachments.push({
      filename: `facture-${orderNumber}.pdf`,
      content: invoicePdfBuffer,
      contentType: 'application/pdf',
    })
  }

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    })

    console.log(`Email sent to ${to} with ${attachments.length} ticket(s)`)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

const ticketTypeLabels: Record<string, string> = {
  STANDARD: 'Standard',
  FLEX: 'Flex',
}

function generateTicketEmailHTML(customerName: string, orderNumber: string, tickets: TicketAttachment[] | undefined, edition: EditionSummary, hasInvoice: boolean = true): string {
  const ticketCount = tickets?.length || 1
  const ticketWord = ticketCount > 1 ? 'e-billets sont' : 'e-billet est'
  const ticketWordSimple = ticketCount > 1 ? 'billets' : 'billet'

  // Generate ticket list HTML if multiple tickets
  let ticketListHTML = ''
  if (tickets && tickets.length > 0) {
    ticketListHTML = `
      <h3 style="color: #1D2B3A; margin: 30px 0 15px 0;">Vos ${ticketCount} ${ticketWordSimple}</h3>
      <table cellpadding="0" cellspacing="0" style="width: 100%; margin-bottom: 20px;">
        ${tickets.map((ticket, index) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #E8E2D1; background-color: ${index % 2 === 0 ? '#F9F8F5' : '#FFFFFF'};">
              <strong style="color: #1D2B3A;">${ticket.attendeeName}</strong>
              <span style="color: #666666; font-size: 14px; margin-left: 10px;">${ticketTypeLabels[ticket.ticketType] || ticket.ticketType}</span>
            </td>
          </tr>
        `).join('')}
      </table>
    `
  }

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vos e-billets</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
            <p style="color: #C9A04A; margin: 10px 0 0 0;">${ticketCount > 1 ? `${ticketCount} E-BILLETS` : 'E-BILLET'}</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Bonjour ${customerName},</h2>

            <p style="color: #333333; line-height: 1.6;">
              Merci pour votre commande ! ${ticketCount > 1 ? `Vos ${ticketCount} ${ticketWord}` : `Votre ${ticketWord}`} en pièce${ticketCount > 1 ? 's' : ''} jointe${ticketCount > 1 ? 's' : ''} de cet email.
              ${hasInvoice ? '<br><strong>Votre facture est également jointe à cet email.</strong>' : ''}
            </p>

            <div style="background-color: #F4EAD5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #666666;">N° de commande</p>
              <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1D2B3A;">${orderNumber}</p>
            </div>

            ${ticketListHTML}

            <h3 style="color: #1D2B3A; margin: 30px 0 15px 0;">Informations pratiques</h3>

            <table cellpadding="0" cellspacing="0" style="width: 100%;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1;">
                  <strong>Date</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1; text-align: right;">
                  ${edition.dateLabel ?? edition.year}
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1;">
                  <strong>Lieu</strong>
                </td>
                <td style="padding: 10px 0; border-bottom: 1px solid #E8E2D1; text-align: right;">
                  ${edition.venueName ?? ''}, ${edition.city ?? ''}
                </td>
              </tr>
            </table>

            <div style="background-color: #C9A04A; color: #1D2B3A; padding: 15px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <strong>Important :</strong> Présentez ${ticketCount > 1 ? 'chaque' : 'votre'} e-billet (imprimé ou sur smartphone) à l'entrée du salon.
              ${ticketCount > 1 ? '<br><span style="font-size: 14px;">Chaque billet est nominatif et sera vérifié à l\'entrée.</span>' : ''}
            </div>

            <p style="color: #666666; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à nous contacter à <a href="mailto:${siteConfig.contact.email}" style="color: #1D2B3A;">${siteConfig.contact.email}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
            <p style="color: #C9A04A; margin: 0; font-size: 12px;">
              ${siteConfig.name} - ${edition.year}<br>
              ${siteConfig.contact.email}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

function generateStandConfirmationHTML(customerName: string, orderNumber: string, standCodes: string[], edition: EditionSummary, hasInvoice: boolean = true): string {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmation de réservation</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
            <p style="color: #C9A04A; margin: 10px 0 0 0;">CONFIRMATION DE RÉSERVATION</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Bonjour ${customerName},</h2>

            <p style="color: #333333; line-height: 1.6;">
              Nous avons le plaisir de vous confirmer la réservation de votre stand pour <strong>${siteConfig.name}</strong>.
            </p>

            <div style="background-color: #F4EAD5; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="margin: 0 0 10px 0; color: #666666;">Stand(s) réservé(s)</p>
              <p style="margin: 0; font-size: 24px; font-weight: bold; color: #1D2B3A;">${standCodes.join(', ')}</p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 14px;">N° de commande : ${orderNumber}</p>
            </div>

            ${hasInvoice ? `
            <div style="background-color: #C9A04A; color: #1D2B3A; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <strong>Votre facture est jointe à cet email.</strong>
            </div>
            ` : ''}

            <h3 style="color: #1D2B3A; margin: 30px 0 15px 0;">Prochaines étapes</h3>

            <ol style="color: #333333; line-height: 1.8; padding-left: 20px;">
              <li>Un guide de l'exposant vous sera envoyé 1 mois avant l'événement.</li>
              <li>Votre badge exposant sera disponible à l'accueil le jour J.</li>
            </ol>

            <p style="color: #666666; font-size: 14px; margin-top: 30px;">
              Pour toute question concernant votre stand, contactez-nous à <a href="mailto:${siteConfig.contact.email}" style="color: #1D2B3A;">${siteConfig.contact.email}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
            <p style="color: #C9A04A; margin: 0; font-size: 12px;">
              ${siteConfig.name} - ${edition.year}<br>
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
 * Send team invitation email
 */
interface SendTeamInvitationOptions {
  to: string
  inviterName: string
  role: string
  inviteUrl: string
  expiresAt: Date
}

const roleLabelsEmail: Record<string, string> = {
  ADMIN: 'Administrateur',
  CONTRIBUTOR: 'Contributeur',
}

export async function sendTeamInvitation(options: SendTeamInvitationOptions): Promise<void> {
  const { to, inviterName, role, inviteUrl, expiresAt } = options

  const roleLabel = roleLabelsEmail[role] || role
  const expiresDate = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Invitation à rejoindre l'équipe ${siteConfig.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation équipe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
            <!-- Header -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
                <p style="color: #C9A04A; margin: 10px 0 0 0;">INVITATION ÉQUIPE</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Vous êtes invité(e) !</h2>

                <p style="color: #333333; line-height: 1.6;">
                  <strong>${inviterName}</strong> vous invite à rejoindre l'équipe d'administration de <strong>${siteConfig.name}</strong> en tant que <strong>${roleLabel}</strong>.
                </p>

                <div style="background-color: #F4EAD5; padding: 20px; border-radius: 8px; margin: 30px 0;">
                  <p style="margin: 0 0 10px 0; color: #666666;">Votre rôle</p>
                  <p style="margin: 0; font-size: 18px; font-weight: bold; color: #1D2B3A;">${roleLabel}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" style="display: inline-block; background-color: #1D2B3A; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Accepter l'invitation
                  </a>
                </div>

                <p style="color: #666666; font-size: 14px; text-align: center;">
                  Cette invitation expire le <strong>${expiresDate}</strong>
                </p>

                <hr style="border: none; border-top: 1px solid #E8E2D1; margin: 30px 0;">

                <p style="color: #666666; font-size: 12px;">
                  Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.<br>
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                  <a href="${inviteUrl}" style="color: #1D2B3A; word-break: break-all;">${inviteUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
                <p style="color: #C9A04A; margin: 0; font-size: 12px;">
                  ${siteConfig.name}<br>
                  ${siteConfig.contact.email}
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log(`Team invitation email sent to ${to}`)
  } catch (error) {
    console.error('Error sending team invitation email:', error)
    throw new Error('Failed to send invitation email')
  }
}

/**
 * Send sponsoring brochure email
 */
interface SendSponsorBrochureOptions {
  to: string
  contactName: string
  companyName: string
  subject: string
  body: string
  attachmentPath?: string
}

export async function sendSponsorBrochure(options: SendSponsorBrochureOptions): Promise<void> {
  const { to, contactName, companyName, subject, body, attachmentPath } = options

  // Convert plain text body to HTML with proper formatting
  const htmlBody = body
    .replace(/\n\n/g, '</p><p style="color: #333333; line-height: 1.6; margin: 15px 0;">')
    .replace(/\n/g, '<br>')

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
        <!-- Header -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
            <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
            <p style="color: #C9A04A; margin: 10px 0 0 0;">SPONSORING</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <p style="color: #333333; line-height: 1.6; margin: 0 0 15px 0;">${htmlBody}</p>

            <div style="background-color: #C9A04A; color: #1D2B3A; padding: 15px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <strong>Vous trouverez notre plaquette de sponsoring en pièce jointe.</strong>
            </div>

            <p style="color: #666666; font-size: 14px;">
              Pour toute question, n'hésitez pas à nous contacter à <a href="mailto:${siteConfig.contact.email}" style="color: #1D2B3A;">${siteConfig.contact.email}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
            <p style="color: #C9A04A; margin: 0; font-size: 12px;">
              ${siteConfig.name}<br>
              ${siteConfig.contact.email}
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `

  const attachments: Array<{ filename: string; path: string }> = []
  if (attachmentPath) {
    attachments.push({
      filename: 'plaquette-sponsoring-cannagri-expo.pdf',
      path: attachmentPath,
    })
  }

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
      attachments,
    })

    console.log(`Sponsoring brochure email sent to ${to} (${companyName})`)
  } catch (error) {
    console.error('Error sending sponsoring brochure email:', error)
    throw new Error('Failed to send sponsoring email')
  }
}

/**
 * Get default sponsoring email template
 */
export function getDefaultSponsorEmailTemplate(contactName: string, companyName: string): { subject: string; body: string } {
  return {
    subject: `${siteConfig.name} - Plaquette de sponsoring`,
    body: `Bonjour ${contactName},

Suite à votre demande d'information concernant les opportunités de sponsoring pour ${siteConfig.name}, nous avons le plaisir de vous transmettre notre plaquette de présentation.

${siteConfig.name} est l'événement de référence du secteur, réunissant professionnels, passionnés et acteurs de l'industrie. En devenant partenaire, ${companyName} bénéficiera d'une visibilité exceptionnelle auprès d'un public ciblé et engagé.

Notre plaquette détaille les différentes formules de partenariat disponibles :
- Partenaire Platine : Visibilité maximale et article en page d'accueil
- Partenaire Or : Forte visibilité en en-tête du site
- Partenaire Argent : Visibilité ciblée
- Partenaire Bronze : Présence en bas de page

Nous restons à votre entière disposition pour échanger sur vos objectifs et vous proposer une formule adaptée à vos besoins.

Cordialement,
L'équipe ${siteConfig.name}`
  }
}

/**
 * Newsletter : lien de confirmation (double opt-in) et lien de désinscription
 */
interface SendNewsletterConfirmationOptions {
  to: string
  confirmUrl: string
  unsubscribeUrl: string
}

export async function sendNewsletterConfirmation(options: SendNewsletterConfirmationOptions): Promise<void> {
  const { to, confirmUrl, unsubscribeUrl } = options
  const unsubscribeApi = unsubscribeUrl.replace('/newsletter/desinscription?', '/api/newsletter/unsubscribe?')
  await transporter.sendMail({
    from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
    replyTo: siteConfig.contact.email,
    to,
    subject: `Confirmez votre inscription aux nouvelles de ${siteConfig.name}`,
    headers: {
      'List-Unsubscribe': `<${unsubscribeApi}>, <mailto:${siteConfig.contact.email}?subject=D%C3%A9sinscription>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
    html: `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmez votre inscription</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
          <tr>
            <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
              <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
              <p style="color: #C9A04A; margin: 10px 0 0 0;">LES NOUVELLES DU SALON</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Encore un clic</h2>
              <p style="color: #333333; line-height: 1.6;">
                Vous avez demandé à recevoir les nouvelles de ${siteConfig.name} : ouverture de la billetterie,
                programme, exposants. Confirmez votre adresse pour finaliser l'inscription.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="display: inline-block; background-color: #C9A04A; color: #1D2B3A; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  Confirmer mon inscription
                </a>
              </div>
              <div style="background-color: #F4EAD5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="color: #1D2B3A; margin: 0; font-size: 14px;">
                  <strong>Ce lien est valable 7 jours.</strong><br>
                  Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : vous ne recevrez rien.
                </p>
              </div>
              <hr style="border: none; border-top: 1px solid #E8E2D1; margin: 30px 0;">
              <p style="color: #666666; font-size: 12px;">
                Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                <a href="${confirmUrl}" style="color: #1D2B3A; word-break: break-all;">${confirmUrl}</a>
              </p>
              <p style="color: #666666; font-size: 12px;">
                Vous pourrez vous désinscrire à tout moment :
                <a href="${unsubscribeUrl}" style="color: #1D2B3A;">se désinscrire</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
              <p style="color: #C9A04A; margin: 0; font-size: 12px;">
                ${siteConfig.name}<br>
                ${siteConfig.contact.email}
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  })
}

/**
 * Send password reset email
 */
interface SendPasswordResetEmailOptions {
  to: string
  name: string
  resetUrl: string
}

export async function sendPasswordResetEmail(options: SendPasswordResetEmailOptions): Promise<void> {
  const { to, name, resetUrl } = options

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Réinitialisation de votre mot de passe - ${siteConfig.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
            <!-- Header -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
                <p style="color: #C9A04A; margin: 10px 0 0 0;">RÉINITIALISATION DE MOT DE PASSE</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Bonjour ${name},</h2>

                <p style="color: #333333; line-height: 1.6;">
                  Vous avez demandé la réinitialisation de votre mot de passe pour votre compte ${siteConfig.name}.
                </p>

                <p style="color: #333333; line-height: 1.6;">
                  Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${resetUrl}" style="display: inline-block; background-color: #1D2B3A; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Réinitialiser mon mot de passe
                  </a>
                </div>

                <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #92400E; margin: 0; font-size: 14px;">
                    <strong>Ce lien expire dans 1 heure.</strong><br>
                    Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.
                  </p>
                </div>

                <hr style="border: none; border-top: 1px solid #E8E2D1; margin: 30px 0;">

                <p style="color: #666666; font-size: 12px;">
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                  <a href="${resetUrl}" style="color: #1D2B3A; word-break: break-all;">${resetUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
                <p style="color: #C9A04A; margin: 0; font-size: 12px;">
                  ${siteConfig.name}<br>
                  ${siteConfig.contact.email}
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log(`Password reset email sent to ${to}`)
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

/**
 * Send email verification email
 */
interface SendVerificationEmailOptions {
  to: string
  name: string
  verificationUrl: string
}

export async function sendVerificationEmail(options: SendVerificationEmailOptions): Promise<void> {
  const { to, name, verificationUrl } = options

  try {
    await transporter.sendMail({
      from: `"${siteConfig.name}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Confirmez votre adresse email - ${siteConfig.name}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vérification d'email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #F4EAD5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF;">
            <!-- Header -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 30px; text-align: center;">
                <h1 style="color: #FFFFFF; margin: 0; font-size: 28px;">${siteConfig.name}</h1>
                <p style="color: #C9A04A; margin: 10px 0 0 0;">BIENVENUE !</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1D2B3A; margin: 0 0 20px 0;">Bonjour ${name},</h2>

                <p style="color: #333333; line-height: 1.6;">
                  Merci de vous être inscrit sur ${siteConfig.name} !
                </p>

                <p style="color: #333333; line-height: 1.6;">
                  Pour activer votre compte et commencer à utiliser nos services, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${verificationUrl}" style="display: inline-block; background-color: #1D2B3A; color: #FFFFFF; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                    Confirmer mon adresse email
                  </a>
                </div>

                <div style="background-color: #F4EAD5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="color: #1D2B3A; margin: 0; font-size: 14px;">
                    <strong>Ce lien expire dans 24 heures.</strong><br>
                    Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
                  </p>
                </div>

                <hr style="border: none; border-top: 1px solid #E8E2D1; margin: 30px 0;">

                <p style="color: #666666; font-size: 12px;">
                  Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                  <a href="${verificationUrl}" style="color: #1D2B3A; word-break: break-all;">${verificationUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #1D2B3A; padding: 20px 30px; text-align: center;">
                <p style="color: #C9A04A; margin: 0; font-size: 12px;">
                  ${siteConfig.name}<br>
                  ${siteConfig.contact.email}
                </p>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    })

    console.log(`Verification email sent to ${to}`)
  } catch (error) {
    console.error('Error sending verification email:', error)
    throw new Error('Failed to send verification email')
  }
}
