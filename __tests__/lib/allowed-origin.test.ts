import { getAllowedOrigins, isAllowedOrigin } from '@/lib/allowed-origin'

describe('isAllowedOrigin', () => {
  const allowed = getAllowedOrigins({ NEXTAUTH_URL: 'http://localhost:3078' })

  it('accepte le site et l’adresse de l’application configurée', () => {
    expect(isAllowedOrigin('https://cannagri-expo.eu', null, allowed)).toBe(true)
    expect(isAllowedOrigin('http://localhost:3078', null, allowed)).toBe(true)
    expect(isAllowedOrigin(null, 'https://www.cannagri-expo.eu/billetterie', allowed)).toBe(true)
  })

  it('refuse un domaine qui ne fait que commencer pareil', () => {
    expect(isAllowedOrigin('https://cannagri-expo.eu.exemple.com', null, allowed)).toBe(false)
    expect(isAllowedOrigin(null, 'https://cannagri-expo.eu.exemple.com/x', allowed)).toBe(false)
    expect(isAllowedOrigin('http://localhost:30789', null, allowed)).toBe(false)
  })

  it('refuse une autre origine ou une valeur illisible', () => {
    expect(isAllowedOrigin('https://exemple.com', null, allowed)).toBe(false)
    expect(isAllowedOrigin('null', null, allowed)).toBe(false)
  })

  it('laisse passer une requête sans origine ni referer (même origine, outils)', () => {
    expect(isAllowedOrigin(null, null, allowed)).toBe(true)
  })
})
