import { csvCell, toCsv } from '@/lib/csv'

describe('csvCell', () => {
  it('échappe les guillemets, points-virgules et retours à la ligne', () => {
    expect(csvCell('a;b')).toBe('"a;b"')
    expect(csvCell('dit "bonjour"')).toBe('"dit ""bonjour"""')
    expect(csvCell('ligne\nsuivante')).toBe('"ligne\nsuivante"')
  })

  it('neutralise les formules de tableur', () => {
    expect(csvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`)
    expect(csvCell('+33 6')).toBe("'+33 6")
    expect(csvCell('@cmd')).toBe("'@cmd")
  })

  it('écrit les dates en ISO et les valeurs vides en cellule vide', () => {
    expect(csvCell(new Date('2026-11-03T10:00:00Z'))).toBe('2026-11-03T10:00:00.000Z')
    expect(csvCell(null)).toBe('')
  })
})

describe('toCsv', () => {
  it('ajoute le BOM et sépare par des points-virgules', () => {
    expect(toCsv(['email', 'source'], [['a@b.fr', 'footer']])).toBe('﻿email;source\r\na@b.fr;footer\r\n')
  })
})
