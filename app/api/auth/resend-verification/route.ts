import { NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'

// POST /api/auth/resend-verification : nouveau lien de vérification pour le compte connecté
export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const rateLimit = checkRateLimit(`resend-verification:${session.user.id}`, RATE_LIMIT_PRESETS.SENSITIVE)
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Trop de demandes. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, emailVerified: true },
    })
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true })
    }

    const token = randomBytes(32).toString('hex')
    await prisma.verificationToken.deleteMany({ where: { identifier: user.email } })
    await prisma.verificationToken.create({
      data: { identifier: user.email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://cannagri-expo.eu'
    await sendVerificationEmail({
      to: user.email,
      name: user.name || 'Utilisateur',
      verificationUrl: `${baseUrl}/verifier-email?token=${token}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json({ error: "Impossible d'envoyer l'e-mail pour le moment." }, { status: 500 })
  }
}
