'use client'

import { useState, useMemo, useEffect, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { siteConfig } from '@/config/site'
import { LanguageSwitcher } from './LanguageSwitcher'
import { locales, type Locale } from '@/i18n/config'
import { NavItem } from '@/types'

const linkBase =
  'inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2.5 font-condensed text-lg font-medium leading-none text-cream/80 transition-colors hover:text-cream whitespace-nowrap'

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-3.5 w-3.5 opacity-70 transition-transform duration-200', open && 'rotate-180')}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

/**
 * Menu déroulant accessible au clavier : bouton qui annonce son état, ouverture au survol
 * ou à Entrée/Espace/flèche bas, fermeture par Échap (le focus revient au bouton) ou en quittant.
 */
function Dropdown({
  label,
  items,
  active,
  align = 'left',
  isCurrent,
}: {
  label: React.ReactNode
  items: { label: string; href?: string; onSelect?: () => void }[]
  active?: boolean
  align?: 'left' | 'right'
  isCurrent: (href: string) => boolean
}) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const wrapper = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)

  const focusItem = (index: number) => {
    const links = wrapper.current?.querySelectorAll<HTMLElement>('[data-menu-item]')
    links?.[index]?.focus()
  }

  return (
    <div
      ref={wrapper}
      className="relative"
      // Survol seulement à la souris : sur tablette, le toucher passe par le clic du bouton
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node)) setOpen(false)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          setOpen(false)
          button.current?.focus()
        }
      }}
    >
      <button
        ref={button}
        type="button"
        className={cn(linkBase, active && 'text-cream')}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            requestAnimationFrame(() => focusItem(0))
          }
        }}
      >
        {label}
        <Chevron open={open} />
      </button>
      <div id={id} hidden={!open} className={cn('absolute top-full z-50 pt-2', align === 'right' ? 'right-0' : 'left-0')}>
        <ul className="min-w-[13rem] rounded-xl bg-cream py-2 shadow-[0_12px_32px_rgba(13,20,27,.35)]">
          {items.map((item) => (
            <li key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  data-menu-item=""
                  aria-current={isCurrent(item.href) ? 'page' : undefined}
                  className="flex min-h-[44px] items-center px-4 font-condensed text-lg font-medium text-forest hover:bg-forest/5 aria-[current=page]:text-gold-ink"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  data-menu-item=""
                  className="flex min-h-[44px] w-full items-center px-4 text-left font-condensed text-lg font-medium text-forest hover:bg-forest/5"
                  onClick={() => {
                    setOpen(false)
                    item.onSelect?.()
                  }}
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** `showPastEditions` : affiche « Éditions passées » dans le menu s'il existe des archives publiées */
export function Header({ showPastEditions = false }: { showPastEditions?: boolean }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const menuButton = useRef<HTMLButtonElement>(null)
  const mobileMenuId = useId()

  const t = useTranslations('common')
  const tNav = useTranslations('nav')

  // Locale courante lue dans le cookie
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr')

  useEffect(() => {
    const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
    if (match && locales.includes(match[1] as Locale)) setCurrentLocale(match[1] as Locale)
  }, [])

  // Sous-menu « L'événement » : tout ce qui décrit le salon
  const eventItems: NavItem[] = useMemo(
    () => [
      { label: tNav('ourVision'), href: '/evenement' },
      { label: tNav('program'), href: '/programme' },
      { label: tNav('exhibitors'), href: '/exposants' },
      { label: tNav('photoGallery'), href: '/mediatheque' },
      ...(showPastEditions ? [{ label: tNav('pastEditions'), href: '/editions' }] : []),
    ],
    [tNav, showPastEditions]
  )

  // Premier niveau : ce qu'on cherche le plus (constat n°12 : Infos pratiques visible)
  const topItems: NavItem[] = useMemo(
    () => [
      { label: tNav('practicalInfo'), href: '/infos-pratiques' },
      { label: tNav('sponsoring'), href: '/sponsoring' },
      { label: tNav('contact'), href: '/contact' },
    ],
    [tNav]
  )

  const user = session?.user
  const accountItems = useMemo(() => {
    if (!user) return []
    const items: { label: string; href?: string; onSelect?: () => void }[] = [{ label: t('myAccount'), href: '/compte' }]
    if (['USER', 'PRO'].includes(user.role)) items.push({ label: t('myTickets'), href: '/compte/billets' })
    if (user.role === 'PRO') items.push({ label: t('myStands'), href: '/compte/stands' })
    if ((user.role === 'PRO' && user.isApproved) || user.role === 'ADMIN') items.push({ label: tNav('proSpace'), href: '/pro' })
    if (['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'].includes(user.role)) items.push({ label: t('admin'), href: '/admin' })
    items.push({ label: t('logout'), onSelect: () => signOut({ callbackUrl: '/' }) })
    return items
  }, [user, t, tNav])

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  const eventActive = eventItems.some((item) => isActive(item.href))

  const closeMobileMenu = useCallback((returnFocus = false) => {
    setIsMobileMenuOpen(false)
    if (returnFocus) menuButton.current?.focus()
  }, [])

  // Menu mobile : Échap le ferme, la page derrière ne défile plus (constat n°59)
  useEffect(() => {
    if (!isMobileMenuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileMenu(true)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [isMobileMenuOpen, closeMobileMenu])

  // Changement de page : le menu mobile se referme
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const userLabel = user ? user.name || user.email?.split('@')[0] || t('user') : ''

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-forest">
      <a href="#contenu" className="skip-link">
        {tNav('skipToContent')}
      </a>
      <div className="container-custom flex h-16 items-center gap-3 lg:h-[72px]">
        {/* Logo d'origine + nom du salon */}
        <Link href="/" className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label={`${siteConfig.name}, ${t('home')}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-96.png" alt="" width={44} height={44} className="h-10 w-10 lg:h-11 lg:w-11" />
          <span className="font-display text-[1.375rem] leading-none text-cream xl:text-[1.625rem]">
            {siteConfig.name}
          </span>
        </Link>

        {/* Navigation ordinateur et tablette paysage */}
        <nav aria-label={tNav('mainNav')} className="ml-auto hidden lg:block">
          <ul className="flex items-center">
            <li>
              <Dropdown label={tNav('event')} items={eventItems} active={eventActive} isCurrent={isActive} />
            </li>
            {topItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(linkBase, 'aria-[current=page]:text-cream aria-[current=page]:underline decoration-mint underline-offset-[6px]')}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2 lg:gap-2">
          {/* Le seul bouton or du header, visible aussi sur mobile (constat n°37) */}
          <ButtonLink href="/billetterie" size="sm" className="px-3.5 sm:px-4">
            {t('tickets')}
          </ButtonLink>

          <div className="hidden items-center lg:flex">
            {status === 'loading' ? (
              <span className="mx-2 h-6 w-16 rounded bg-cream/10" aria-hidden="true" />
            ) : user ? (
              <Dropdown
                align="right"
                label={<span className="max-w-[7.5rem] truncate">{userLabel}</span>}
                items={accountItems}
                isCurrent={isActive}
              />
            ) : (
              <Link href="/connexion" className={cn(linkBase, 'text-cream/70')}>
                {t('login')}
              </Link>
            )}
            <LanguageSwitcher currentLocale={currentLocale} variant="flag-dropdown" />
          </div>

          {/* Bouton du menu mobile */}
          <button
            ref={menuButton}
            type="button"
            className="ml-1 inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-cream/20 text-cream lg:hidden"
            onClick={() => setIsMobileMenuOpen((o) => !o)}
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
            aria-label={isMobileMenuOpen ? tNav('closeMenu') : tNav('openMenu')}
          >
            {isMobileMenuOpen ? (
              <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id={mobileMenuId}
        hidden={!isMobileMenuOpen}
        className="absolute inset-x-0 top-16 h-[calc(100dvh-4rem)] overflow-y-auto border-t border-cream/10 bg-forest lg:hidden"
      >
        <nav aria-label={tNav('mainNav')} className="container-custom pb-10 pt-4">
          <p className="px-1 pb-1 pt-2 font-condensed text-base font-semibold text-mint">{tNav('event')}</p>
          <ul>
            {eventItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className="flex min-h-[48px] items-center border-b border-cream/10 px-1 font-condensed text-2xl font-semibold text-cream aria-[current=page]:text-mint"
                  onClick={() => closeMobileMenu()}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-5 border-t border-cream/25">
            {topItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className="flex min-h-[48px] items-center border-b border-cream/10 px-1 font-condensed text-2xl font-semibold text-cream aria-[current=page]:text-mint"
                  onClick={() => closeMobileMenu()}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {user ? (
              <>
                <p className="px-1 pb-1 font-condensed text-base font-semibold text-mint">{userLabel}</p>
                <ul>
                  {accountItems.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="flex min-h-[44px] items-center px-1 font-condensed text-xl font-medium text-cream/85"
                          onClick={() => closeMobileMenu()}
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className="flex min-h-[44px] w-full items-center px-1 text-left font-condensed text-xl font-medium text-cream/85"
                          onClick={() => {
                            closeMobileMenu()
                            item.onSelect?.()
                          }}
                        >
                          {item.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link
                href="/connexion"
                className="flex min-h-[44px] items-center px-1 font-condensed text-xl font-medium text-cream/85 underline decoration-cream/40 underline-offset-[6px]"
                onClick={() => closeMobileMenu()}
              >
                {t('login')}
              </Link>
            )}
          </div>

          <div className="mt-6 border-t border-cream/10 px-1 pt-5">
            <p className="mb-2 font-condensed text-base font-semibold text-cream/70">{t('language')}</p>
            <LanguageSwitcher currentLocale={currentLocale} variant="inline" theme="dark" />
          </div>
        </nav>
      </div>
    </header>
  )
}
