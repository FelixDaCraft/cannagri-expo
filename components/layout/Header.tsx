'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { LanguageSwitcher } from './LanguageSwitcher'
import { locales, type Locale } from '@/i18n/config'
import { NavItem } from '@/types'

// Fallback logo SVG
function LogoFallback() {
  return (
    <svg viewBox="0 0 48 48" className="w-full h-full p-2">
      <circle cx="24" cy="24" r="22" fill="#3D5A45" />
      <text x="24" y="30" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">CA</text>
    </svg>
  )
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()
  const { data: session, status } = useSession()

  const t = useTranslations('common')
  const tNav = useTranslations('nav')

  // Détecter la locale courante depuis le cookie
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr')

  useEffect(() => {
    const getLocaleFromCookie = () => {
      const match = document.cookie.match(/NEXT_LOCALE=([^;]+)/)
      if (match && locales.includes(match[1] as Locale)) {
        return match[1] as Locale
      }
      return 'fr'
    }
    setCurrentLocale(getLocaleFromCookie())

    // Écouter les changements de cookie
    const interval = setInterval(() => {
      const newLocale = getLocaleFromCookie()
      setCurrentLocale(prev => prev !== newLocale ? newLocale : prev)
    }, 500)

    return () => clearInterval(interval)
  }, [])

  // Navigation avec traductions
  const navigation: NavItem[] = useMemo(() => [
    { label: tNav('ourVision'), href: "/evenement" },
    {
      label: tNav('theEvent'),
      href: "/programme",
      children: [
        { label: tNav('program'), href: "/programme" },
        { label: tNav('exhibitors'), href: "/exposants" },
        { label: tNav('photoGallery'), href: "/mediatheque" },
        { label: tNav('practicalInfo'), href: "/infos-pratiques" },
      ],
    },
    { label: tNav('sponsoring'), href: "/sponsoring" },
    { label: tNav('contact'), href: "/contact" },
    {
      label: tNav('proSpace'),
      href: "/pro",
      children: [
        { label: tNav('becomeExhibitor'), href: "/pro" },
        { label: tNav('bookStand'), href: "/pro/plan" },
      ],
    },
  ], [tNav])

  // Vérifier si l'utilisateur est un PRO validé ou un ADMIN
  const canAccessProSpace = useMemo(() => {
    if (!session?.user) return false
    const { role, isApproved } = session.user
    // Admin peut toujours accéder
    if (role === 'ADMIN') return true
    // PRO doit être approuvé par un admin
    if (role === 'PRO' && isApproved) return true
    return false
  }, [session])

  // Filtrer la navigation pour masquer "Espace Pro" si non autorisé
  const filteredNavigation = useMemo(() => {
    return navigation.filter(item => {
      if (item.href === '/pro') {
        return canAccessProSpace
      }
      return true
    })
  }, [canAccessProSpace, navigation])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-forest h-16">
      <div className="container-custom h-full">
        <div className="flex items-center h-full">
          {/* Logo - fixe à gauche */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-12 h-12">
              {logoError ? (
                <LogoFallback />
              ) : (
                <Image
                  src="/images/logo.PNG"
                  alt={siteConfig.name}
                  fill
                  className="object-contain"
                  priority
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
            <span className="font-heading font-bold text-white text-lg hidden sm:block whitespace-nowrap">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation - centré avec flex-1 */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-4">
            <div className="flex items-center gap-1">
              {filteredNavigation.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-colors rounded-lg hover:bg-white/10 whitespace-nowrap',
                      isActive(item.href) && 'text-white bg-white/10'
                    )}
                  >
                    {item.label}
                    {item.children && (
                      <svg
                        className={cn(
                          "w-3 h-3 opacity-70 transition-transform duration-200",
                          openDropdown === item.label && "rotate-180"
                        )}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown with invisible bridge to prevent hover gap issue */}
                  {item.children && openDropdown === item.label && (
                    <div className="absolute top-full left-0 pt-2 z-50">
                      {/* Invisible bridge area */}
                      <div className="absolute -top-2 left-0 right-0 h-2" />
                      <div className="bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                        {item.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-cream hover:text-forest transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* CTA Buttons & User Menu - fixe à droite */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link href="/billetterie">
              <Button variant="secondary" size="sm">
                {t('tickets')}
              </Button>
            </Link>

            {status === 'loading' ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            ) : session?.user ? (
              /* Menu utilisateur connecté */
              <div
                className="relative"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt=""
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-terracotta rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-white text-sm font-medium max-w-[120px] truncate">
                    {session.user.name || session.user.email?.split('@')[0]}
                  </span>
                  <svg className={cn(
                    "w-4 h-4 text-white/70 transition-transform duration-200",
                    userMenuOpen && "rotate-180"
                  )} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu with invisible bridge */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50">
                    {/* Invisible bridge area */}
                    <div className="absolute -top-2 left-0 right-0 h-2" />
                    <div className="bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-medium text-gray-900 truncate">{session.user.name || t('user')}</p>
                      <p className="text-sm text-gray-500 truncate">{session.user.email}</p>
                    </div>

                    <Link
                      href="/compte"
                      className="block px-4 py-2 text-gray-700 hover:bg-cream hover:text-forest transition-colors"
                    >
                      <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {t('myAccount')}
                    </Link>

                    {['USER', 'PRO'].includes(session.user.role) && (
                      <Link
                        href="/compte/billets"
                        className="block px-4 py-2 text-gray-700 hover:bg-cream hover:text-forest transition-colors"
                      >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        {t('myTickets')}
                      </Link>
                    )}

                    {session.user.role === 'PRO' && (
                      <Link
                        href="/compte/stands"
                        className="block px-4 py-2 text-gray-700 hover:bg-cream hover:text-forest transition-colors"
                      >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {t('myStands')}
                      </Link>
                    )}

                    {['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'].includes(session.user.role) && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-gray-700 hover:bg-cream hover:text-forest transition-colors"
                      >
                        <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {t('admin')}
                      </Link>
                    )}

                    <hr className="my-2 border-gray-100" />

                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {t('logout')}
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Boutons connexion/inscription */
              <div className="flex items-center gap-2">
                <Link href="/connexion">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                    {t('login')}
                  </Button>
                </Link>
                <Link href="/inscription">
                  <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-forest">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Séparateur */}
            <div className="w-px h-6 bg-white/20" />

            {/* Language Switcher - tout à droite */}
            <LanguageSwitcher currentLocale={currentLocale} variant="flag-dropdown" />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-16 left-0 right-0 bg-forest border-t border-white/10">
            <nav className="container-custom py-4">
              {filteredNavigation.map((item) => (
                <div key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 font-heading text-white/90 hover:text-white hover:bg-white/10 rounded-lg',
                      isActive(item.href) && 'text-white bg-white/10'
                    )}
                    onClick={() => !item.children && setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className="block px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {/* Language Switcher Mobile */}
              <div className="px-4 py-3 border-t border-white/10">
                <p className="text-white/60 text-xs mb-2 uppercase tracking-wider">{t('language')}</p>
                <LanguageSwitcher currentLocale={currentLocale} variant="inline" theme="dark" />
              </div>

              <div className="px-4 pt-4 space-y-3">
                <Link href="/billetterie" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    {t('tickets')}
                  </Button>
                </Link>

                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg">
                      {session.user.image ? (
                        <img src={session.user.image} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-terracotta rounded-full flex items-center justify-center text-white font-bold">
                          {(session.user.name || session.user.email || '?').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{session.user.name || t('user')}</p>
                        <p className="text-white/60 text-sm truncate">{session.user.email}</p>
                      </div>
                    </div>

                    <Link href="/compte" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-forest">
                        {t('myAccount')}
                      </Button>
                    </Link>

                    {['USER', 'PRO'].includes(session.user.role) && (
                      <Link href="/compte/billets" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-forest">
                          {t('myTickets')}
                        </Button>
                      </Link>
                    )}

                    {session.user.role === 'PRO' && (
                      <Link href="/compte/stands" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-forest">
                          {t('myStands')}
                        </Button>
                      </Link>
                    )}

                    {['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR'].includes(session.user.role) && (
                      <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-forest">
                          {t('admin')}
                        </Button>
                      </Link>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full text-red-300 hover:text-red-100 hover:bg-red-500/20"
                      onClick={() => {
                        setIsMobileMenuOpen(false)
                        signOut({ callbackUrl: '/' })
                      }}
                    >
                      {t('logout')}
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/connexion" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-white hover:bg-white/10">
                        {t('login')}
                      </Button>
                    </Link>
                    <Link href="/inscription" className="flex-1" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-forest">
                        {t('register')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
