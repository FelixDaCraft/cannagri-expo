import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'
import { detectSpam } from '@/lib/anti-spam'

// 5 demandes de plaquette par heure et par adresse IP
const PAR_IP = { limit: 5, windowSeconds: 3600 }
const LONGUEURS = { companyName: 150, contactName: 150, email: 254, phone: 40 }

const texte = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
const succes = (id?: string) =>
  NextResponse.json({ success: true, message: 'Demande enregistrée avec succès', data: id ? { id } : {} })

export async function POST(request: NextRequest) {
  const limite = checkRateLimit(`sponsor-request:${getClientIP(request)}`, PAR_IP)
  if (!limite.success) {
    return NextResponse.json(
      { error: 'Trop de demandes. Réessayez dans un moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((limite.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const companyName = texte(body.companyName)
    const contactName = texte(body.contactName)
    const email = texte(body.email).toLowerCase()
    const phone = texte(body.phone)

    // Validation
    if (!companyName || !contactName || !email) {
      return NextResponse.json(
        { error: 'Veuillez remplir tous les champs obligatoires' },
        { status: 400 }
      )
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Veuillez fournir une adresse email valide' },
        { status: 400 }
      )
    }
    if (
      companyName.length > LONGUEURS.companyName ||
      contactName.length > LONGUEURS.contactName ||
      email.length > LONGUEURS.email ||
      phone.length > LONGUEURS.phone
    ) {
      return NextResponse.json({ error: 'Un des champs est trop long' }, { status: 400 })
    }

    // Spam : on répond comme pour une vraie demande, sans rien enregistrer (le robot n'apprend rien)
    const spam = detectSpam(body)
    if (spam) {
      console.warn(`[sponsor-request] demande ignorée (spam : ${spam})`)
      return succes()
    }

    const sponsorRequest = await prisma.sponsorRequest.create({
      data: { companyName, contactName, email, phone: phone || null, status: 'PENDING' },
    })

    return succes(sponsorRequest.id)
  } catch (error) {
    console.error('Error creating sponsor request:', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'enregistrement de votre demande' },
      { status: 500 }
    )
  }
}
