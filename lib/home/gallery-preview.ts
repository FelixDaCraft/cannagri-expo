export interface PreviewPhoto {
  id: string
  /** Image affichée (miniature si elle existe) */
  src: string
  alt: string
  caption: string | null
  category: string | null
}

/**
 * Choisit `count` photos pour l'aperçu de l'accueil en alternant les catégories
 * (allées, conférences, remise des prix…) pour éviter cinq fois la même scène.
 * L'ordre de la galerie est respecté au sein de chaque catégorie.
 */
export function pickGalleryPreview<T extends PreviewPhoto>(photos: T[], count: number): T[] {
  const groups = new Map<string, T[]>()
  for (const photo of photos) {
    const key = photo.category ?? ''
    const group = groups.get(key)
    if (group) group.push(photo)
    else groups.set(key, [photo])
  }

  const queues = Array.from(groups.values())
  const picked: T[] = []
  for (let round = 0; picked.length < count; round++) {
    let added = false
    for (const queue of queues) {
      if (round < queue.length && picked.length < count) {
        picked.push(queue[round])
        added = true
      }
    }
    if (!added) break
  }
  return picked
}
