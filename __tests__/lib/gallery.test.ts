import { isGalleryThumbnail, galleryFileType } from '@/lib/gallery'

describe('isGalleryThumbnail', () => {
  it('reconnaît les miniatures générées pour la grille', () => {
    expect(isGalleryThumbnail('2024_20240419111903-mini.jpg')).toBe(true)
    expect(isGalleryThumbnail('photo-MINI.webp')).toBe(true)
  })

  it('ne confond pas une photo avec une miniature', () => {
    expect(isGalleryThumbnail('2024_20240419111903.jpg')).toBe(false)
    expect(isGalleryThumbnail('minimal.jpg')).toBe(false)
  })
})

describe('galleryFileType', () => {
  it('donne le type des images acceptées', () => {
    expect(galleryFileType('2024_1766113359810_oljax3.jpg')).toBe('image/jpeg')
    expect(galleryFileType('a.JPEG')).toBe('image/jpeg')
    expect(galleryFileType('a.png')).toBe('image/png')
    expect(galleryFileType('a.webp')).toBe('image/webp')
  })

  it('refuse tout nom qui sortirait du dossier de la galerie', () => {
    expect(galleryFileType('../.env')).toBeNull()
    expect(galleryFileType('..%2F.env.jpg')).toBeNull()
    expect(galleryFileType('sous/dossier.jpg')).toBeNull()
    expect(galleryFileType('.gitkeep')).toBeNull()
    expect(galleryFileType('script.js')).toBeNull()
  })
})

describe('isGalleryPhoto', () => {
  it('garde les photos et écarte miniatures, fichiers cachés et copies d’images externes', () => {
    const { isGalleryPhoto } = jest.requireActual('@/lib/gallery') as typeof import('@/lib/gallery')
    expect(isGalleryPhoto('2024_salon.jpg')).toBe(true)
    expect(isGalleryPhoto('2024_salon-mini.jpg')).toBe(false)
    expect(isGalleryPhoto('.DS_Store')).toBe(false)
    expect(isGalleryPhoto('ext-0123456789abcdef01234567.png')).toBe(false)
    expect(isGalleryPhoto('notes.txt')).toBe(false)
  })
})
