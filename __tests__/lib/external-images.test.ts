/**
 * @jest-environment node
 */
import { needsLocalCopy, isPrivateAddress, storeImage, localizeImageUrl, localizeSpeakers, type ImageDeps } from '@/lib/external-images'

const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex')

function deps(overrides: Partial<ImageDeps> = {}): ImageDeps & { written: Map<string, Buffer> } {
  const written = new Map<string, Buffer>()
  return {
    written,
    fetch: jest.fn(async () => new Response(png, { status: 200, headers: { 'content-type': 'image/png' } })) as unknown as typeof fetch,
    lookup: jest.fn(async () => ['93.184.216.34']),
    writeFile: jest.fn(async (file: string, data: Buffer) => { written.set(file, data) }),
    dir: '/tmp/galerie',
    siteHost: 'cannagri-expo.eu',
    ...overrides,
  }
}

describe('needsLocalCopy', () => {
  it('repère les images hébergées ailleurs ou embarquées en base64', () => {
    expect(needsLocalCopy('https://i.ibb.co/x/logo.png')).toBe(true)
    expect(needsLocalCopy('http://media.licdn.com/a.jpg')).toBe(true)
    expect(needsLocalCopy('data:image/png;base64,AAAA')).toBe(true)
  })
  it('laisse les images déjà sur le site', () => {
    expect(needsLocalCopy('/images/logos/norml.webp')).toBe(false)
    expect(needsLocalCopy('https://cannagri-expo.eu/images/a.png', 'cannagri-expo.eu')).toBe(false)
    expect(needsLocalCopy(null)).toBe(false)
    expect(needsLocalCopy('')).toBe(false)
  })
})

describe('isPrivateAddress', () => {
  it.each(['127.0.0.1', '10.1.2.3', '192.168.1.122', '172.16.0.1', '169.254.169.254', '0.0.0.0', '::1', 'fc00::1', 'fe80::1'])('bloque %s', (ip) => {
    expect(isPrivateAddress(ip)).toBe(true)
  })
  it('accepte une adresse publique', () => {
    expect(isPrivateAddress('93.184.216.34')).toBe(false)
  })
})

describe('storeImage', () => {
  it('enregistre une copie dans le volume de la galerie et renvoie son adresse publique', async () => {
    const d = deps()
    const local = await storeImage('https://i.ibb.co/x/logo.png', d)
    expect(local).toMatch(/^\/images\/gallery\/ext-[0-9a-f]{24}\.png$/)
    expect(Array.from(d.written.keys())[0]).toBe(`/tmp/galerie/${local.split('/').pop()}`)
  })

  it('décode une image embarquée en base64', async () => {
    const d = deps()
    const local = await storeImage(`data:image/png;base64,${png.toString('base64')}`, d)
    expect(local).toMatch(/\.png$/)
    expect(d.fetch).not.toHaveBeenCalled()
  })

  it('refuse une adresse interne (SSRF)', async () => {
    await expect(storeImage('http://localhost/x.png', deps())).rejects.toThrow()
    await expect(storeImage('https://exemple.test/x.png', deps({ lookup: jest.fn(async () => ['192.168.1.122']) }))).rejects.toThrow()
  })

  it('refuse ce qui n’est pas une image JPEG, PNG ou WebP, ou qui est trop lourd', async () => {
    const html = deps({ fetch: jest.fn(async () => new Response('<html>', { headers: { 'content-type': 'text/html' } })) as unknown as typeof fetch })
    await expect(storeImage('https://exemple.test/x', html)).rejects.toThrow()
    const big = deps({ fetch: jest.fn(async () => new Response(Buffer.alloc(6 * 1024 * 1024), { headers: { 'content-type': 'image/jpeg' } })) as unknown as typeof fetch })
    await expect(storeImage('https://exemple.test/x.jpg', big)).rejects.toThrow()
    await expect(storeImage('data:image/svg+xml;base64,PHN2Zz4=', deps())).rejects.toThrow()
  })

  it('refuse une réponse en erreur (503 des hébergeurs gratuits)', async () => {
    const down = deps({ fetch: jest.fn(async () => new Response('', { status: 503 })) as unknown as typeof fetch })
    await expect(storeImage('https://i.ibb.co/x.png', down)).rejects.toThrow()
  })
})

describe('localizeImageUrl', () => {
  it('garde l’adresse d’origine si la copie échoue (l’enregistrement n’est pas bloqué)', async () => {
    const down = deps({ fetch: jest.fn(async () => new Response('', { status: 503 })) as unknown as typeof fetch })
    expect(await localizeImageUrl('https://i.ibb.co/x.png', down)).toBe('https://i.ibb.co/x.png')
  })
  it('ne touche pas aux images locales', async () => {
    const d = deps()
    expect(await localizeImageUrl('/images/logos/a.webp', d)).toBe('/images/logos/a.webp')
    expect(d.fetch).not.toHaveBeenCalled()
  })
})

describe('localizeSpeakers', () => {
  it('rapatrie la photo de chaque intervenant sans toucher au reste', async () => {
    const d = deps()
    const out = await localizeSpeakers([{ name: 'A', photo: 'https://media.licdn.com/a.jpg' }, { name: 'B', photo: '' }], d)
    expect(out[0].name).toBe('A')
    expect(out[0].photo).toMatch(/^\/images\/gallery\/ext-/)
    expect(out[1]).toEqual({ name: 'B', photo: '' })
  })
  it('renvoie la valeur telle quelle si ce n’est pas une liste', async () => {
    expect(await localizeSpeakers(null, deps())).toBeNull()
  })
})
