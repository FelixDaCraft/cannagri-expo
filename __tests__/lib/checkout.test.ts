import { parseVisitorCustomer, CheckoutValidationError } from '@/lib/checkout'

const valid = { name: 'Alice Martin', email: 'Alice@Example.fr', acceptTerms: true }

describe('parseVisitorCustomer', () => {
  it("normalise le nom et l'e-mail de l'acheteur", () => {
    expect(parseVisitorCustomer({ ...valid, name: '  Alice   Martin ', email: ' Alice@Example.FR ' })).toEqual({
      name: 'Alice Martin',
      email: 'alice@example.fr',
      phone: null,
    })
  })

  it('garde un téléphone facultatif valide', () => {
    expect(parseVisitorCustomer({ ...valid, phone: ' +33 6 12 34 56 78 ' }).phone).toBe('+33 6 12 34 56 78')
    expect(parseVisitorCustomer({ ...valid, phone: '' }).phone).toBeNull()
  })

  it.each([
    ['sans objet client', null],
    ['nom manquant', { ...valid, name: '' }],
    ['nom trop court', { ...valid, name: 'A' }],
    ['nom trop long', { ...valid, name: 'A'.repeat(101) }],
    ['nom non textuel', { ...valid, name: 42 }],
    ['e-mail invalide', { ...valid, email: 'alice@' }],
    ['e-mail avec espace', { ...valid, email: 'ali ce@example.fr' }],
    ['e-mail trop long', { ...valid, email: `${'a'.repeat(250)}@x.fr` }],
    ['e-mail non textuel', { ...valid, email: ['a@b.fr'] }],
    ['téléphone fantaisiste', { ...valid, phone: 'appelez-moi' }],
    ['téléphone trop long', { ...valid, phone: '1'.repeat(31) }],
    ['CGV non acceptées', { ...valid, acceptTerms: false }],
    ['CGV acceptées en texte', { ...valid, acceptTerms: 'true' }],
  ])('refuse : %s', (_label, raw) => {
    expect(() => parseVisitorCustomer(raw)).toThrow(CheckoutValidationError)
  })

  it('refuse un formulaire dont le champ piège est rempli (robot)', () => {
    expect(() => parseVisitorCustomer({ ...valid, website: 'http://spam.example' })).toThrow(CheckoutValidationError)
  })
})
