import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIP, RATE_LIMIT_PRESETS } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - 5 registration attempts per minute per IP
    const clientIP = getClientIP(request)
    const rateLimitResult = checkRateLimit(`register:${clientIP}`, RATE_LIMIT_PRESETS.AUTH)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez réessayer plus tard.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)),
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, password, companyName, phone, siret, businessType, wantsPro, newsletter } = body

    // Validation de base
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nom, email et mot de passe requis' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Validation PRO - uniquement si wantsPro est true
    if (wantsPro) {
      if (!companyName) {
        return NextResponse.json(
          { error: 'Le nom de l\'entreprise est requis pour un compte professionnel' },
          { status: 400 }
        )
      }
      if (!siret) {
        return NextResponse.json(
          { error: 'Le SIRET est requis pour un compte professionnel' },
          { status: 400 }
        )
      }
      if (!businessType) {
        return NextResponse.json(
          { error: 'Le type d\'activité est requis pour un compte professionnel' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec cet email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    // - USER role par défaut (visiteurs publics)
    // - PRO role si wantsPro est true (exposants professionnels)
    // Les comptes admin/contributor sont créés via invitations
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        hashedPassword,
        phone: phone || null,
        // Infos PRO uniquement si demandé
        ...(wantsPro && {
          companyName,
          siret,
          businessType,
        }),
        role: wantsPro ? 'PRO' : 'USER',
        isApproved: wantsPro ? false : true, // USER accounts are auto-approved, PRO need admin validation
      }
    })

    // If newsletter opt-in, add to subscribers
    if (newsletter) {
      await prisma.newsletterSubscriber.upsert({
        where: { email: email.toLowerCase() },
        update: {
          name,
          isActive: true,
          unsubscribedAt: null,
        },
        create: {
          email: email.toLowerCase(),
          name,
          isActive: true,
        }
      })
    }

    // Create verification token and send email
    const verificationToken = randomBytes(32).toString('hex')
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: verificationToken,
        expires: tokenExpiry,
      }
    })

    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://cannagri-expo.eu'
    const verificationUrl = `${baseUrl}/verifier-email?token=${verificationToken}`

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name || 'Utilisateur',
        verificationUrl,
      })
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails - user can request a new one
    }

    const isPro = wantsPro === true

    return NextResponse.json({
      success: true,
      message: isPro
        ? 'Compte créé avec succès. Un email de vérification a été envoyé. Votre demande de compte professionnel sera examinée après vérification.'
        : 'Compte créé avec succès. Veuillez vérifier votre email pour activer votre compte.',
      isPro,
      requiresEmailVerification: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création du compte' },
      { status: 500 }
    )
  }
}
