/**
 * @jest-environment node
 */
import { detectSpam, looksLikeGibberish } from '@/lib/anti-spam'

// Demandes réelles reçues en 2026 (aucune ne doit être bloquée)
const REELLES = [
  { companyName: "C'BORDER", contactName: 'Tristan Babin', phone: '+33652753135' },
  { companyName: 'FLORFACTORY', contactName: 'DEBUS BAPTISTE', phone: '0656718447' },
  { companyName: 'Romain GABRIEL - Les Têtes Fleuries', contactName: 'Romain GABRIEL', phone: '0652031805' },
  { companyName: 'Ripple.tcc', contactName: 'Alex Bousseton', phone: '06 34 82 96 29' },
  { companyName: 'Marchetto et Fils /La Plaza du Cbd', contactName: 'Jerome Marchetto', phone: '+33762984089' },
  { companyName: 'McDonaldsCBD', contactName: 'Jean-Marc DeLaTour', phone: '' },
  { companyName: 'Hemp Industries', contactName: 'Hélène Industry', phone: '(+33) 6.12.12.12.12' },
]

// Spams reçus en janvier 2026 (chaînes aléatoires, lettres dans le téléphone)
const SPAMS = [
  { companyName: 'dyxbOaJpimIZBOoQET', contactName: 'EeRNAstyqesLPVKOu', phone: 'sQvWiwvnTNEode' },
  { companyName: 'nJFPxBjAdWyZWVmBwWQue', contactName: 'BShfnXpcluwzHiKfyAzaz', phone: 'AtpUlTFeimbAUo' },
  { companyName: 'aCHOJMchQbxduyIwflQ', contactName: 'TjtwnYlaEZVHZlpnyzBevI', phone: 'jNbrjFbRRQmMbg' },
]

const NOW = 1_800_000_000_000
const base = { email: 'contact@exemple.fr', website: '', startedAt: NOW - 20_000 }

describe('looksLikeGibberish', () => {
  it('reconnaît les chaînes aléatoires en casse mélangée', () => {
    expect(looksLikeGibberish('dyxbOaJpimIZBOoQET')).toBe(true)
    expect(looksLikeGibberish('nJFPxBjAdWyZWVmBwWQue')).toBe(true)
  })
  it('laisse passer les noms réels, même collés ou en capitales', () => {
    for (const s of ['FLORFACTORY', 'McDonaldsCBD', 'Ripple.tcc', 'Jean-Marc DeLaTour', "C'BORDER", 'Les Têtes Fleuries']) {
      expect(looksLikeGibberish(s)).toBe(false)
    }
  })
})

describe('detectSpam', () => {
  it('ne bloque aucune demande réelle', () => {
    for (const r of REELLES) expect(detectSpam({ ...base, ...r }, NOW)).toBeNull()
  })
  it('bloque les spams reçus', () => {
    for (const s of SPAMS) expect(detectSpam({ ...base, ...s }, NOW)).not.toBeNull()
  })
  it('bloque même si un seul champ est aléatoire mais que le téléphone contient des lettres', () => {
    expect(detectSpam({ ...base, companyName: 'Société Test', contactName: 'Paul Martin', phone: 'abcdefghij' }, NOW)).toBe('telephone')
  })
  it('bloque le champ piège rempli', () => {
    expect(detectSpam({ ...base, ...REELLES[0], website: 'http://spam.example' }, NOW)).toBe('piege')
  })
  it('bloque un envoi trop rapide (moins de 3 s après l’affichage)', () => {
    expect(detectSpam({ ...base, ...REELLES[0], startedAt: NOW - 1_200 }, NOW)).toBe('trop-rapide')
  })
  it('ignore un horodatage absent ou incohérent (ancien formulaire en cache)', () => {
    expect(detectSpam({ ...base, ...REELLES[0], startedAt: undefined }, NOW)).toBeNull()
    expect(detectSpam({ ...base, ...REELLES[0], startedAt: 'abc' }, NOW)).toBeNull()
    expect(detectSpam({ ...base, ...REELLES[0], startedAt: NOW + 60_000 }, NOW)).toBeNull()
  })
})
