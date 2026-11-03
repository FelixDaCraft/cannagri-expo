import path from 'path'

/** Dossier des photos de la galerie (volume persistant monté dans public/) */
export const GALLERY_DIR = path.join(process.cwd(), 'public', 'images', 'gallery')

const TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** Miniature carrée de la grille (« <photo>-mini.jpg »), à ne pas traiter comme une photo */
export function isGalleryThumbnail(file: string): boolean {
  return /-mini\.(jpe?g|png|webp)$/i.test(file)
}

/** Photo de la galerie (ni miniature, ni copie d'une image externe « ext-… » : logos, intervenants) */
export function isGalleryPhoto(file: string): boolean {
  return /\.(jpe?g|png|webp)$/i.test(file) && !file.startsWith('.') && !file.startsWith('ext-') && !isGalleryThumbnail(file)
}

/**
 * Type MIME d'un fichier de la galerie, ou null si le nom n'est pas un simple
 * fichier image du dossier (protège contre toute sortie du dossier).
 */
export function galleryFileType(file: string): string | null {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(file)) return null
  return TYPES[path.extname(file).toLowerCase()] ?? null
}
