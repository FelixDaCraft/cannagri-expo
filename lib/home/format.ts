/** « 10h00 » → « 10h », comme sur l'affiche */
export function shortHour(hour: string): string {
  return hour.replace(/h00$/, 'h')
}

/** « 10h00 - 19h30 » → « 10h – 19h30 » */
export function shortHoursRange(label: string | null): string | null {
  if (!label) return null
  return label
    .split(' - ')
    .map((part) => shortHour(part.trim()))
    .join(' – ')
}

export interface PosterImage {
  src: string
  srcSet?: string
  width?: number
  height?: number
}

// Versions allégées des affiches (l'original de 1,7 Mo est réservé au téléchargement)
const OPTIMIZED_POSTERS: Record<string, Required<PosterImage>> = {
  '/images/affiche-2027.png': {
    src: '/images/affiche-2027-880.webp',
    srcSet: '/images/affiche-2027-560.webp 560w, /images/affiche-2027-880.webp 880w',
    width: 880,
    height: 1237,
  },
}

export function optimizedPoster(posterUrl: string | null): PosterImage | null {
  if (!posterUrl) return null
  return OPTIMIZED_POSTERS[posterUrl] ?? { src: posterUrl }
}
