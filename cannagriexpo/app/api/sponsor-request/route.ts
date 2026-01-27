import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyName, contactName, email, phone } = body

    // Validation
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Veuillez fournir une adresse email valide' },
        { status: 400 }
      )
    }

    // Create sponsor request
    const sponsorRequest = await prisma.sponsorRequest.create({
      data: {
        companyName,
        contactName,
        email,
        phone: phone || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Demande enregistrée avec succès',
      data: { id: sponsorRequest.id },
    })
  } catch (error) {
    console.error('Error creating sponsor request:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de votre demande' },
      { status: 500 }
    )
  }
}
