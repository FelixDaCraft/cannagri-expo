import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { checkAdminAuth, unauthorizedResponse } from '@/lib/admin-auth'
import { getAdminEdition, findEditionByYear } from '@/lib/editions/admin'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'images', 'gallery')

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

// Sync files on disk with database
async function syncFilesWithDatabase() {
  await ensureUploadDir()

  try {
    // Get all files on disk
    const files = await readdir(UPLOAD_DIR)
    const imageFiles = files.filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f) && !f.startsWith('.')
    )

    // Get all media from database
    const dbMedia = await prisma.media.findMany()
    const dbUrls = new Set(dbMedia.map(m => m.imageUrl))

    // Find files on disk that are not in database
    const newFiles: string[] = []
    for (const file of imageFiles) {
      const url = `/images/gallery/${file}`
      if (!dbUrls.has(url)) {
        newFiles.push(file)
      }
    }

    // Add new files to database
    if (newFiles.length > 0) {
      const fallbackEdition = await getAdminEdition()
      const mediaToCreate = await Promise.all(newFiles.map(async file => {
        // Try to extract edition from filename (e.g., IMG20240419... -> 2024),
        // otherwise attach the photo to the edition being managed
        const yearMatch = file.match(/(\d{4})/)
        const edition = (yearMatch && await findEditionByYear(yearMatch[1])) || fallbackEdition

        // Clean up filename for caption
        const caption = file
          .replace(/\.(jpg|jpeg|png|webp)$/i, '')
          .replace(/^IMG/, '')
          .replace(/_/g, ' ')
          .trim()

        return {
          imageUrl: `/images/gallery/${file}`,
          caption: caption || `Photo ${edition.year}`,
          editionId: edition.id,
          category: 'Général',
          altText: `Photo ${edition.year}`,
        }
      }))

      await prisma.media.createMany({
        data: mediaToCreate,
        skipDuplicates: true,
      })
    }

    // Clean up database entries for files that no longer exist
    const existingFiles = new Set(imageFiles.map(f => `/images/gallery/${f}`))
    const orphanedMedia = dbMedia.filter(m => !existingFiles.has(m.imageUrl))

    if (orphanedMedia.length > 0) {
      await prisma.media.deleteMany({
        where: {
          id: {
            in: orphanedMedia.map(m => m.id)
          }
        }
      })
    }

    return { synced: newFiles.length, removed: orphanedMedia.length }
  } catch (error) {
    console.error('Error syncing files:', error)
    return { synced: 0, removed: 0 }
  }
}

// GET - List all media (with sync)
export async function GET(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    const { searchParams } = new URL(request.url)
    const sync = searchParams.get('sync') !== 'false'

    // Sync files with database if requested (default: true)
    if (sync) {
      await syncFilesWithDatabase()
    }

    const rows = await prisma.media.findMany({
      orderBy: [
        { edition: { year: 'desc' } },
        { displayOrder: 'asc' },
        { createdAt: 'desc' },
      ],
      include: { edition: { select: { year: true } } },
    })
    // Le client manipule l'année de l'édition sous forme de chaîne ("2024", "2025"...)
    const media = rows.map(({ edition, ...m }) => ({ ...m, edition: String(edition.year) }))

    return NextResponse.json(media)
  } catch (error) {
    console.error('Error fetching media:', error)
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
  }
}

// POST - Upload new media
export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const session = await checkAdminAuth()
    if (!session) {
      return unauthorizedResponse()
    }

    await ensureUploadDir()

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const caption = formData.get('caption') as string || ''
    const editionYear = formData.get('edition') as string | null
    const edition = editionYear ? await findEditionByYear(editionYear) : await getAdminEdition()
    if (!edition) {
      return NextResponse.json({ error: `L'édition ${editionYear} n'existe pas` }, { status: 400 })
    }
    const category = formData.get('category') as string || 'Général'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    // Extension dérivée du type MIME validé (jamais du nom fourni par le client)
    const ext = { 'image/png': 'png', 'image/webp': 'webp' }[file.type] ?? 'jpg'
    const filename = `${edition.year}_${timestamp}_${randomStr}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    // Write file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Save to database
    const media = await prisma.media.create({
      data: {
        imageUrl: `/images/gallery/${filename}`,
        caption,
        editionId: edition.id,
        category,
        altText: caption || `Photo ${edition.year}`,
      },
    })

    return NextResponse.json({ ...media, edition: String(edition.year) }, { status: 201 })
  } catch (error) {
    console.error('Error uploading media:', error)
    return NextResponse.json({ error: 'Failed to upload media' }, { status: 500 })
  }
}
