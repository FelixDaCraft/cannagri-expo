import { formatVenueAddress } from '@/lib/editions/format'

describe('formatVenueAddress', () => {
  it('ne répète pas la ville déjà présente dans l’adresse', () => {
    expect(formatVenueAddress('2 Rue du Sénégal, 44200 Nantes', 'Nantes')).toBe('2 Rue du Sénégal, 44200 Nantes')
    expect(formatVenueAddress('2 rue du Sénégal, 44200 NANTES', 'Nantes')).toBe('2 rue du Sénégal, 44200 NANTES')
  })

  it('ajoute la ville quand l’adresse ne la contient pas', () => {
    expect(formatVenueAddress('2 Rue du Sénégal', 'Nantes')).toBe('2 Rue du Sénégal, Nantes')
  })

  it('se contente de ce qui est renseigné', () => {
    expect(formatVenueAddress(null, 'Nantes')).toBe('Nantes')
    expect(formatVenueAddress('2 Rue du Sénégal', null)).toBe('2 Rue du Sénégal')
    expect(formatVenueAddress(null, null)).toBeNull()
    expect(formatVenueAddress('  ', '')).toBeNull()
  })
})
