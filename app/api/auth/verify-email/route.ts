import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token manquant' },
        { status: 400 }
      )
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        token,
        expires: {
          gt: new Date(),
        },
      },
    })

    // If token not found, check if user is already verified
    // This handles the case where the token was already used (double-click, etc.)
    if (!verificationToken) {
      // Try to find a user who recently had this token (check by searching all users)
      // Since we can't know which user without the token, return a generic message
      return NextResponse.json(
        { error: 'Lien de vérification invalide ou expiré.' },
        { status: 400 }
      )
    }

    // Find user by email (identifier in VerificationToken)
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé.' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      // Try to delete the token, but don't fail if it doesn't exist
      try {
        await prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token,
            },
          },
        })
      } catch {
        // Token already deleted, ignore
      }

      return NextResponse.json({
        success: true,
        alreadyVerified: true
      })
    }

    // Verify email and delete token atomically
    // Use a try-catch to handle race conditions where another request already processed this
    try {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        }),
        prisma.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: verificationToken.identifier,
              token: verificationToken.token,
            },
          },
        }),
      ])

      console.log(`Email verified for: ${user.email}`)
      return NextResponse.json({ success: true })
    } catch (txError: unknown) {
      // If the transaction failed because the token was already deleted,
      // check if the user is now verified (another request succeeded)
      const txErrorCode = txError && typeof txError === 'object' && 'code' in txError ? (txError as { code: string }).code : null
      if (txErrorCode === 'P2025') {
        const refreshedUser = await prisma.user.findUnique({
          where: { id: user.id },
        })

        if (refreshedUser?.emailVerified) {
          return NextResponse.json({
            success: true,
            alreadyVerified: true
          })
        }
      }

      throw txError
    }
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Veuillez réessayer.' },
      { status: 500 }
    )
  }
}
