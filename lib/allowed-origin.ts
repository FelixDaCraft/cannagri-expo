/** Origines autorisées pour les requêtes qui modifient des données (protection CSRF). */
const STATIC_ORIGINS = [
  'https://cannagri-expo.eu',
  'https://www.cannagri-expo.eu',
  'https://dev.cannagri-expo.eu',
  'http://localhost:3000',
]

function toOrigin(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

export function getAllowedOrigins(env: Record<string, string | undefined> = process.env): string[] {
  const fromEnv = [env.NEXT_PUBLIC_APP_URL, env.NEXTAUTH_URL].map(toOrigin).filter((o): o is string => !!o)
  return Array.from(new Set([...STATIC_ORIGINS, ...fromEnv]))
}

/**
 * Compare l'origine (ou à défaut le referer) à la liste, à l'identique :
 * « https://cannagri-expo.eu.exemple.com » n'est pas « https://cannagri-expo.eu ».
 */
export function isAllowedOrigin(origin: string | null, referer: string | null, allowed: string[]): boolean {
  if (!origin && !referer) return true
  const source = origin ? toOrigin(origin) : toOrigin(referer)
  return !!source && allowed.includes(source)
}
