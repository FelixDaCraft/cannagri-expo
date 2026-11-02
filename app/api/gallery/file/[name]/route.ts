import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { GALLERY_DIR, galleryFileType } from '@/lib/gallery'

/**
 * Sert une photo de la galerie depuis le disque.
 * Next.js ne sert que les fichiers de public/ présents au démarrage : sans cette route,
 * une photo ajoutée ensuite (admin, import) reste en 404 jusqu'au redémarrage.
 * Appelée via la réécriture de repli /images/gallery/:name (next.config.js).
 */
export async function GET(_request: Request, { params }: { params: { name: string } }) {
  const type = galleryFileType(params.name)
  if (!type) return new NextResponse(null, { status: 404 })

  try {
    const file = await readFile(path.join(GALLERY_DIR, params.name))
    return new NextResponse(file, {
      headers: {
        'Content-Type': type,
        'Cache-Control': 'public, max-age=86400',
      },
    })
  } catch {
    return new NextResponse(null, { status: 404 })
  }
}
