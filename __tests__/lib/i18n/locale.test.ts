import { pickLocaleFromHeader, resolveLocale } from '@/lib/locale'

describe('pickLocaleFromHeader', () => {
  it('renvoie le français sans en-tête', () => {
    expect(pickLocaleFromHeader(null)).toBe('fr')
    expect(pickLocaleFromHeader('')).toBe('fr')
  })

  it('renvoie le français quand aucune langue demandée n’est proposée', () => {
    expect(pickLocaleFromHeader('zh-CN,zh;q=0.9,ja;q=0.8')).toBe('fr')
    expect(pickLocaleFromHeader('*')).toBe('fr')
  })

  it('suit la langue préférée quand le site la propose', () => {
    expect(pickLocaleFromHeader('fr-FR,fr;q=0.9,en;q=0.8')).toBe('fr')
    expect(pickLocaleFromHeader('en-US,en;q=0.9')).toBe('en')
    expect(pickLocaleFromHeader('de-DE,de;q=0.9,en;q=0.8')).toBe('de')
    expect(pickLocaleFromHeader('it')).toBe('it')
    expect(pickLocaleFromHeader('ES-es')).toBe('es')
  })

  it('respecte les poids, pas l’ordre d’écriture', () => {
    expect(pickLocaleFromHeader('en;q=0.4,es;q=0.8')).toBe('es')
  })

  it('ignore les langues refusées (q=0) et les poids illisibles', () => {
    expect(pickLocaleFromHeader('en;q=0')).toBe('fr')
    expect(pickLocaleFromHeader('en;q=abc')).toBe('fr')
  })

  it('passe à la langue proposée suivante si la première ne l’est pas', () => {
    expect(pickLocaleFromHeader('pt-BR,pt;q=0.9,it;q=0.5')).toBe('it')
  })
})

describe('resolveLocale', () => {
  it('donne la priorité au choix explicite (cookie)', () => {
    expect(resolveLocale('de', 'en-US')).toBe('de')
  })

  it('ignore un cookie invalide', () => {
    expect(resolveLocale('xx', 'it')).toBe('it')
    expect(resolveLocale('xx', null)).toBe('fr')
  })

  it('se rabat sur la langue du navigateur, puis le français', () => {
    expect(resolveLocale(undefined, 'es')).toBe('es')
    expect(resolveLocale(undefined, null)).toBe('fr')
  })
})
