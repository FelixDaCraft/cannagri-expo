import { shortHour, shortHoursRange, optimizedPoster } from '@/lib/home/format'

describe('shortHour', () => {
  it('retire les minutes nulles, comme sur l’affiche', () => {
    expect(shortHour('10h00')).toBe('10h')
    expect(shortHour('19h30')).toBe('19h30')
  })
})

describe('shortHoursRange', () => {
  it('met en forme la plage horaire avec un tiret demi-cadratin', () => {
    expect(shortHoursRange('10h00 - 19h30')).toBe('10h – 19h30')
    expect(shortHoursRange('9h00')).toBe('9h')
  })

  it('renvoie null sans horaire', () => {
    expect(shortHoursRange(null)).toBeNull()
  })
})

describe('optimizedPoster', () => {
  it('sert la version allégée de l’affiche 2027 quand elle existe', () => {
    expect(optimizedPoster('/images/affiche-2027.png')).toEqual({
      src: '/images/affiche-2027-880.webp',
      srcSet: '/images/affiche-2027-560.webp 560w, /images/affiche-2027-880.webp 880w',
      width: 880,
      height: 1237,
    })
  })

  it('garde l’affiche d’origine sinon', () => {
    expect(optimizedPoster('/images/autre.png')).toEqual({ src: '/images/autre.png' })
    expect(optimizedPoster(null)).toBeNull()
  })
})
