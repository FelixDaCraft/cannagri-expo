'use client'

import { useEffect, useRef, type ElementType, type ReactNode, type CSSProperties, type HTMLAttributes } from 'react'

declare global {
  interface Window {
    __revealReady?: boolean
  }
}

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'style'> {
  children: ReactNode
  /** Décalage en millisecondes, pour faire entrer les éléments d'un groupe l'un après l'autre */
  delay?: number
  as?: ElementType
  className?: string
  style?: CSSProperties
}

/**
 * Apparition douce au défilement (fondu + 14 px, une seule fois).
 * Le contenu est rendu visible côté serveur : seul l'attribut posé sur <html> par
 * `revealBootScript` le masque, en attendant que l'élément entre à l'écran.
 */
export function Reveal({ children, delay = 0, as: Tag = 'div', className, style, ...rest }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    window.__revealReady = true
    const el = ref.current
    if (!el) return
    if (!document.documentElement.hasAttribute('data-reveal-on') || typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-shown', '')
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-shown', '')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? { ...style, transitionDelay: `${delay}ms` } : style}
    >
      {children}
    </Tag>
  )
}
