// Destinations autorisées après connexion : chemins internes au site,
// ou sous-domaines listés ci-dessous (doivent aussi figurer dans AUTH_REDIRECT_HOSTS).
const EXTERNAL_REDIRECT_HOSTS = ['planner.cannagri-expo.eu']

export function getSafeCallbackUrl(raw: string | null, currentOrigin?: string): string {
  if (!raw) return '/'

  // Chemin relatif, en excluant les URL « //hote » et « /\hote »
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) {
    return raw
  }

  try {
    const url = new URL(raw)
    if (currentOrigin && url.origin === currentOrigin) {
      return `${url.pathname}${url.search}${url.hash}`
    }
    if (url.protocol === 'https:' && EXTERNAL_REDIRECT_HOSTS.includes(url.hostname)) {
      return url.toString()
    }
  } catch {
    // URL invalide
  }
  return '/'
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}
