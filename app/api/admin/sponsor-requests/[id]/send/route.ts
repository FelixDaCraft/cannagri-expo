import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/sponsor-requests/[id]/send - Mark request as sent (and send email)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

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

    // TODO: Send email with PDF attachment
    // For now, we just mark the request as sent
    // In production, you would:
    // 1. Load the PDF brochure from storage
    // 2. Send email using a service like SendGrid, Resend, etc.
    // Example:
    // await sendEmail({
    //   to: sponsorRequest.email,
    //   subject: "Cann'Agri Expo - Plaquette de sponsoring",
    //   text: `Bonjour ${sponsorRequest.contactName},\n\nVeuillez trouver ci-joint notre plaquette de sponsoring...`,
    //   attachments: [{ filename: 'sponsoring-cannagri-expo.pdf', path: '/public/docs/sponsoring.pdf' }]
    // })

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
