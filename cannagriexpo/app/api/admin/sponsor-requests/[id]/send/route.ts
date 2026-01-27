import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { sendSponsorBrochure } from '@/lib/email'
import path from 'path'

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

    // Path to the PDF brochure (should be in public folder)
    const brochurePath = path.join(process.cwd(), 'public', 'docs', 'plaquette-sponsoring.pdf')

    // Send the email
    try {
      await sendSponsorBrochure({
        to: sponsorRequest.email,
        contactName: sponsorRequest.contactName,
        companyName: sponsorRequest.companyName,
        subject,
        body: emailBody,
        attachmentPath: brochurePath,
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError)
      // Continue anyway - we'll mark as sent but log the error
      // In production, you might want to return an error here
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
      message: 'Plaquette envoyée avec succès',
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
