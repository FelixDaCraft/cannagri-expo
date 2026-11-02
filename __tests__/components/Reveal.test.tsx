import { render, screen, act } from '@testing-library/react'
import { Reveal } from '@/components/ui/Reveal'

type ObserverCallback = (entries: Array<{ isIntersecting: boolean; target: Element }>) => void

let lastCallback: ObserverCallback | null = null
const observe = jest.fn()
const unobserve = jest.fn()
const disconnect = jest.fn()

beforeEach(() => {
  lastCallback = null
  ;(window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = jest.fn((cb: ObserverCallback) => {
    lastCallback = cb
    return { observe, unobserve, disconnect }
  })
})

afterEach(() => {
  document.documentElement.removeAttribute('data-reveal-on')
  delete window.__revealReady
})

describe('Reveal', () => {
  it('affiche directement le contenu quand les animations ne sont pas activées', () => {
    render(<Reveal>Bonjour</Reveal>)
    const el = screen.getByText('Bonjour')
    expect(el).toHaveAttribute('data-reveal')
    expect(el).toHaveAttribute('data-shown')
    expect(window.IntersectionObserver).not.toHaveBeenCalled()
  })

  it('attend l’entrée à l’écran quand les animations sont activées, une seule fois', () => {
    document.documentElement.setAttribute('data-reveal-on', '')
    render(<Reveal>Billets</Reveal>)
    const el = screen.getByText('Billets')
    expect(el).not.toHaveAttribute('data-shown')
    expect(observe).toHaveBeenCalledWith(el)

    act(() => lastCallback!([{ isIntersecting: true, target: el }]))
    expect(el).toHaveAttribute('data-shown')
    expect(unobserve).toHaveBeenCalledWith(el)
  })

  it('signale au script de démarrage que le JavaScript a pris le relais', () => {
    render(<Reveal>Texte</Reveal>)
    expect(window.__revealReady).toBe(true)
  })

  it('applique le décalage et la balise demandés', () => {
    render(
      <Reveal as="li" delay={120}>
        Élément
      </Reveal>
    )
    const el = screen.getByText('Élément')
    expect(el.tagName).toBe('LI')
    expect(el.style.transitionDelay).toBe('120ms')
  })
})
