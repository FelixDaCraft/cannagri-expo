jest.mock('@/lib/prisma', () => ({ prisma: {} }))
import { toGalleryPhoto } from '@/lib/gallery-photos'

const row = { id: 'm1', imageUrl: '/a.jpg', thumbnailUrl: '/a-mini.jpg', caption: 'Légende', altText: 'Texte alternatif' }

describe('toGalleryPhoto', () => {
  it('préfère le texte alternatif', () => {
    expect(toGalleryPhoto(row, 'Photo')).toEqual({ id: 'm1', src: '/a.jpg', thumb: '/a-mini.jpg', alt: 'Texte alternatif', caption: 'Légende' })
  })

  it('se rabat sur la légende, puis sur le libellé fourni', () => {
    expect(toGalleryPhoto({ ...row, altText: ' ' }, 'Photo').alt).toBe('Légende')
    expect(toGalleryPhoto({ ...row, altText: null, caption: null }, 'Photo 2024')).toMatchObject({ alt: 'Photo 2024', caption: null })
  })
})
