/**
 * Filtre anti-spam des formulaires publics (demande de plaquette sponsor).
 * Signaux invisibles pour un humain : champ piège, envoi trop rapide,
 * lettres dans le téléphone, chaînes aléatoires en casse mélangée
 * (le profil des spams reçus : « dyxbOaJpimIZBOoQET », téléphone « sQvWiwvnTNEode »).
 */

export type SpamReason = 'piege' | 'trop-rapide' | 'telephone' | 'charabia'

export interface SpamInput {
  companyName?: unknown
  contactName?: unknown
  phone?: unknown
  /** champ piège, caché aux humains */
  website?: unknown
  /** horodatage (ms) de l'affichage du formulaire */
  startedAt?: unknown
}

/** Délai minimum entre l'affichage du formulaire et l'envoi */
export const DELAI_MINIMUM_MS = 3_000

// drapeau « u » via RegExp : la cible TypeScript du projet (es5) refuse la forme littérale
const LETTRE = new RegExp('^\\p{L}$', 'u')
const MOT_EN_LETTRES = new RegExp('^\\p{L}+$', 'u')
const UNE_LETTRE = new RegExp('\\p{L}', 'gu')
const estMinuscule = (c: string) => LETTRE.test(c) && c === c.toLowerCase() && c !== c.toUpperCase()
const estMajuscule = (c: string) => LETTRE.test(c) && c === c.toUpperCase() && c !== c.toLowerCase()

/** Vrai si un mot ressemble à une suite de lettres tapées au hasard en casse mélangée */
function motAleatoire(mot: string): boolean {
  if (mot.length < 10 || !MOT_EN_LETTRES.test(mot)) return false
  const lettres = Array.from(mot)
  let bascules = 0
  for (let i = 1; i < lettres.length; i++) {
    if (estMinuscule(lettres[i - 1]) && estMajuscule(lettres[i])) bascules++
  }
  if (bascules >= 3) return true
  // deux bascules seulement : on exige un mot long, avec un mélange franc de majuscules et minuscules
  const part = lettres.filter(estMajuscule).length / lettres.length
  return bascules >= 2 && lettres.length >= 14 && part > 0.25 && part < 0.75
}

export function looksLikeGibberish(texte: string): boolean {
  return texte.trim().split(/\s+/).some(motAleatoire)
}

const texte = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

/** Renvoie la raison du blocage, ou null si la demande paraît humaine */
export function detectSpam(input: SpamInput, now = Date.now()): SpamReason | null {
  if (texte(input.website)) return 'piege'

  const debut = Number(input.startedAt)
  if (input.startedAt !== undefined && Number.isFinite(debut) && debut <= now && now - debut < DELAI_MINIMUM_MS) {
    return 'trop-rapide'
  }

  const lettresTel = texte(input.phone).match(UNE_LETTRE)?.length ?? 0
  if (lettresTel >= 3) return 'telephone'

  if (looksLikeGibberish(texte(input.companyName)) || looksLikeGibberish(texte(input.contactName))) return 'charabia'

  return null
}
