import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'

const DATA_DIR = path.join(process.cwd(), 'data')
const INFOS_FILE = path.join(DATA_DIR, 'infos-pratiques.json')

// Ensure data directory exists
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

// Default infos pratiques
const defaultInfos = {
  eventDate: '28 Mars 2026',
  eventTime: '9h00 - 19h00',
  eventLocation: "L'Agronaute",
  eventAddress: '24 quai de la Fosse',
  eventCity: 'Nantes',
  accessTransport: 'Tramway ligne 1, arrêt Médiathèque. Bus C3, C4, arrêt Chantiers Navals.',
  accessParking: 'Parking Médiathèque à 200m. Parking Commerce à 500m.',
  accessInfo: 'Le lieu est accessible aux personnes à mobilité réduite.',
  ticketInfo: 'Les billets sont disponibles en ligne. Présentez votre QR code à l\'entrée.',
  contactEmail: 'hello@cannagri-expo.fr',
  contactPhone: '+33 2 XX XX XX XX',
}

// GET - Read infos pratiques
export async function GET() {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    await ensureDataDir()

    if (!existsSync(INFOS_FILE)) {
      return NextResponse.json(defaultInfos)
    }

    const data = await readFile(INFOS_FILE, 'utf-8')
    const infos = JSON.parse(data)
    return NextResponse.json({ ...defaultInfos, ...infos })
  } catch (error) {
    console.error('Error reading infos pratiques:', error)
    return NextResponse.json(defaultInfos)
  }
}

// POST - Save infos pratiques
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    await ensureDataDir()

    const body = await request.json()

    // Merge with defaults
    const infos = { ...defaultInfos, ...body }

    // Save to file
    await writeFile(INFOS_FILE, JSON.stringify(infos, null, 2), 'utf-8')

    return NextResponse.json(infos)
  } catch (error) {
    console.error('Error saving infos pratiques:', error)
    return NextResponse.json({ error: 'Failed to save infos pratiques' }, { status: 500 })
  }
}
