import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { sendSponsorBrochure } from '@/lib/email'
import path from 'path'
import fs from 'fs'

const BROCHURES = [
  { file: 'plaquette-sponsoring.pdf', filename: 'plaquette-sponsoring-cannagri-expo-2027.pdf' },
  { file: 'plaquette-platinum-cup.pdf', filename: 'plaquette-sponsoring-platinum-cbd-cup-2027.pdf' },
]

// POST /api/admin/sponsor-requests/[id]/send - Send brochure email and mark as sent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { id } = await params

    // Get the email content from request body
    const body = await request.json().catch(() => ({}))
    const { subject, emailBody } = body as { subject?: string; emailBody?: string }

    // Get the sponsor request
    const sponsorRequest = await prisma.sponsorRequest.findUnique({
      where: { id },
    })

    if (!sponsorRequest) {
      return NextResponse.json(
        { error: 'Demande non trouvée' },
        { status: 404 }
      )
    }

    if (sponsorRequest.status === 'SENT') {
      return NextResponse.json(
        { error: 'Cette demande a déjà été traitée' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: 'Le sujet et le contenu du mail sont requis' },
        { status: 400 }
      )
    }

    // Les deux plaquettes 2027 (salon et Platinum CBD Cup), déposées dans public/docs sur le serveur
    const brochures = BROCHURES.map(b => ({ filename: b.filename, path: path.join(process.cwd(), 'public', 'docs', b.file) }))
    const manquante = brochures.find(b => !fs.existsSync(b.path))
    if (manquante) {
      console.error(`Plaquette introuvable : ${manquante.path}`)
      return NextResponse.json(
        { error: `Plaquette introuvable sur le serveur (${path.basename(manquante.path)}) : rien n'a été envoyé.` },
        { status: 500 }
      )
    }

    // Un échec d'envoi est signalé et la demande reste « à envoyer »
    try {
      await sendSponsorBrochure({
        to: sponsorRequest.email,
        contactName: sponsorRequest.contactName,
        companyName: sponsorRequest.companyName,
        subject,
        body: emailBody,
        attachments: brochures,
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      const detail = emailError instanceof Error ? emailError.message : String(emailError)
      return NextResponse.json(
        { error: `L'e-mail n'est pas parti (${detail}). La demande reste à envoyer.` },
        { status: 502 }
      )
    }

    // Update the request status
    const updatedRequest = await prisma.sponsorRequest.update({
      where: { id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Plaquettes envoyées avec succès',
      data: updatedRequest,
    })
  } catch (error) {
    console.error('Error sending sponsor brochure:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de la plaquette' },
      { status: 500 }
    )
  }
}
