import { createHash } from 'crypto'
import { lookup as dnsLookup } from 'dns/promises'
import { isIP } from 'net'
import { writeFile as fsWriteFile } from 'fs/promises'
import path from 'path'
import { GALLERY_DIR } from '@/lib/gallery'
import { siteConfig } from '@/config/site'

/**
 * Copie sur le site des images hébergées ailleurs (i.ibb.co, postimg, media.licdn.com…) ou
 * embarquées en base64 dans la base. Les copies vont dans le volume persistant de la galerie
 * (public/images/gallery, servi même pour un fichier ajouté après le démarrage), préfixées
 * « ext- » pour ne pas être prises pour des photos de la galerie.
 */

const MAX_BYTES = 5 * 1024 * 1024
const TIMEOUT_MS = 15_000
const EXTENSIONS: Record<string, string> = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }
export const EXTERNAL_IMAGE_PREFIX = 'ext-'

export interface ImageDeps {
  fetch: typeof fetch
  lookup: (host: string) => Promise<string[]>
  writeFile: (file: string, data: Buffer) => Promise<void>
  dir: string
  siteHost: string
}

const defaultDeps = (): ImageDeps => ({
  fetch: globalThis.fetch,
  lookup: async (host) => (await dnsLookup(host, { all: true })).map((a) => a.address),
  writeFile: (file, data) => fsWriteFile(file, data),
  dir: GALLERY_DIR,
  siteHost: new URL(siteConfig.url).hostname,
})

export function needsLocalCopy(url: string | null | undefined, siteHost = new URL(siteConfig.url).hostname): url is string {
  if (!url) return false
  if (url.startsWith('data:image/')) return true
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.hostname !== siteHost
  } catch {
    return false
  }
}

/** Adresses internes interdites (protection contre les requêtes vers le réseau du serveur) */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v = ip.toLowerCase()
    if (v === '::1' || v === '::') return true
    if (v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe80')) return true
    const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    return mapped ? isPrivateAddress(mapped[1]) : false
  }
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127)
  )
}

async function assertPublicHost(url: URL, deps: ImageDeps) {
  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('Hôte interne refusé')
  const addresses = isIP(host) ? [host] : await deps.lookup(host)
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new Error('Adresse interne refusée')
}

async function download(url: string, deps: ImageDeps): Promise<{ data: Buffer; type: string }> {
  if (url.startsWith('data:')) {
    const match = url.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=\s]+)$/)
    if (!match) throw new Error('Image embarquée illisible')
    return { data: Buffer.from(match[2], 'base64'), type: match[1] }
  }
  const parsed = new URL(url)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Protocole refusé')
  await assertPublicHost(parsed, deps)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await deps.fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'CannAgriExpo/1.0 (copie de logo)' } })
    if (!res.ok) throw new Error(`Réponse ${res.status}`)
    if (res.url) await assertPublicHost(new URL(res.url), deps)
    const length = Number(res.headers.get('content-length') || 0)
    if (length > MAX_BYTES) throw new Error('Image trop lourde')
    const data = Buffer.from(await res.arrayBuffer())
    return { data, type: (res.headers.get('content-type') || '').split(';')[0].trim().toLowerCase() }
  } finally {
    clearTimeout(timer)
  }
}

/** Télécharge (ou décode) l'image et l'enregistre ; renvoie son adresse sur le site */
export async function storeImage(url: string, deps: ImageDeps = defaultDeps()): Promise<string> {
  const { data, type } = await download(url, deps)
  const ext = EXTENSIONS[type]
  if (!ext) throw new Error(`Format refusé : ${type || 'inconnu'}`)
  if (data.length === 0 || data.length > MAX_BYTES) throw new Error('Taille d’image refusée')
  const name = `${EXTERNAL_IMAGE_PREFIX}${createHash('sha256').update(data).digest('hex').slice(0, 24)}.${ext}`
  await deps.writeFile(path.join(deps.dir, name), data)
  return `/images/gallery/${name}`
}

/** Version qui ne bloque jamais un enregistrement : en cas d'échec, l'adresse d'origine est gardée */
export async function localizeImageUrl<T extends string | null | undefined>(url: T, deps: ImageDeps = defaultDeps()): Promise<T | string> {
  if (!needsLocalCopy(url, deps.siteHost)) return url
  try {
    return await storeImage(url, deps)
  } catch (error) {
    console.warn(`Image externe non copiée (${url.slice(0, 80)}) :`, error instanceof Error ? error.message : error)
    return url
  }
}

/** Photos des intervenants (champ JSON speakers d'un événement) */
export async function localizeSpeakers<T>(speakers: T, deps: ImageDeps = defaultDeps()): Promise<T> {
  if (!Array.isArray(speakers)) return speakers
  const out = []
  for (const speaker of speakers) {
    if (speaker && typeof speaker === 'object' && typeof speaker.photo === 'string' && speaker.photo) {
      out.push({ ...speaker, photo: await localizeImageUrl(speaker.photo, deps) })
    } else {
      out.push(speaker)
    }
  }
  return out as T
}
