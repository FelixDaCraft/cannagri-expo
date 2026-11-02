import { pickGalleryPreview, type PreviewPhoto } from '@/lib/home/gallery-preview'

const photo = (id: string, category: string | null): PreviewPhoto => ({
  id,
  src: `/images/gallery/${id}.jpg`,
  alt: `Photo ${id}`,
  caption: null,
  category,
})

describe('pickGalleryPreview', () => {
  it('varie les catégories avant de reprendre la même', () => {
    const photos = [
      photo('a1', 'Ambiance'),
      photo('a2', 'Ambiance'),
      photo('a3', 'Ambiance'),
      photo('c1', 'Conférences'),
      photo('r1', 'Remise des prix'),
      photo('c2', 'Conférences'),
    ]
    expect(pickGalleryPreview(photos, 4).map((p) => p.id)).toEqual(['a1', 'c1', 'r1', 'a2'])
  })

  it('garde l’ordre d’origine au sein d’une catégorie et accepte les photos sans catégorie', () => {
    const photos = [photo('x1', null), photo('x2', null), photo('a1', 'Ambiance')]
    expect(pickGalleryPreview(photos, 3).map((p) => p.id)).toEqual(['x1', 'a1', 'x2'])
  })

  it('renvoie moins de photos quand la galerie est petite', () => {
    expect(pickGalleryPreview([photo('a1', 'Ambiance')], 5)).toHaveLength(1)
    expect(pickGalleryPreview([], 5)).toEqual([])
  })
})
