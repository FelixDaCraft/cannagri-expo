'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import { navigation, siteConfig } from '@/config/site'

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
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-forest h-20">
      <div className="container-custom h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-12 h-12 bg-white rounded-full overflow-hidden">
              {logoError ? (
                <LogoFallback />
              ) : (
                <Image
                  src="/images/logo.png"
                  alt={siteConfig.name}
                  fill
                  className="object-contain p-1"
                  priority
                  onError={() => setLogoError(true)}
                />
              )}
            </div>
            <span className="font-heading font-bold text-white text-xl hidden sm:block">
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    'px-4 py-2 font-heading font-medium text-white/90 hover:text-white transition-colors rounded-lg hover:bg-white/10',
                    isActive(item.href) && 'text-white bg-white/10'
                  )}
                >
                  {item.label}
                  {item.children && (
                    <svg
                      className="inline-block w-4 h-4 ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </Link>

                {/* Dropdown */}
                {item.children && openDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-2 min-w-[200px]">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        href={child.href}
                        className="block px-4 py-2 text-body hover:bg-cream hover:text-forest transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link href="/billetterie">
              <Button variant="secondary" size="sm">
                Billetterie
              </Button>
            </Link>
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
          <div className="lg:hidden absolute top-20 left-0 right-0 bg-forest border-t border-white/10">
            <nav className="container-custom py-4">
              {navigation.map((item) => (
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
              <div className="px-4 pt-4">
                <Link href="/billetterie" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">
                    Billetterie
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
