import { hostedLogo } from '@/lib/editions/logo'

describe('hostedLogo', () => {
  it('garde les logos hébergés sur le site', () => {
    expect(hostedLogo('/images/logos/norml.webp')).toBe('/images/logos/norml.webp')
    expect(hostedLogo('/uploads/logos/abc.png')).toBe('/uploads/logos/abc.png')
  })

  it('écarte les logos externes et les images embarquées', () => {
    expect(hostedLogo('https://i.ibb.co/x/logo.png')).toBeNull()
    expect(hostedLogo('//i.postimg.cc/x.png')).toBeNull()
    expect(hostedLogo('data:image/png;base64,AAAA')).toBeNull()
  })

  it('renvoie null sans logo', () => {
    expect(hostedLogo(null)).toBeNull()
    expect(hostedLogo('')).toBeNull()
  })
})
