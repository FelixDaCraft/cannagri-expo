/**
 * Seuls les logos hébergés sur le site sont affichés : les hébergeurs gratuits (i.ibb.co, postimg…)
 * tombaient en panne et ralentissaient la page (constat n°47). Sans logo local, on affiche l'initiale.
 */
export function hostedLogo(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('/') && !url.startsWith('//') ? url : null
}
