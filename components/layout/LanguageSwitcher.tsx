'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { locales, localeNames, localeFlagCodes, type Locale } from '@/i18n/config'
import { cn } from '@/lib/utils'

// Flag component using flagcdn.com
function Flag({ locale, size = 20 }: { locale: Locale; size?: number }) {
  const code = localeFlagCodes[locale]
  return (
    <Image
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={localeNames[locale]}
      width={size}
      height={Math.round(size * 0.75)}
      className="rounded-sm object-cover"
      unoptimized
    />
  )
}

interface LanguageSwitcherProps {
  currentLocale?: Locale
  variant?: 'dropdown' | 'inline' | 'flags' | 'flag-dropdown'
  className?: string
  theme?: 'light' | 'dark'
}

export function LanguageSwitcher({
  currentLocale = 'fr',
  variant = 'flags',
  className,
  theme = 'light',
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    // Set the locale cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`

    // Close dropdown first
    setIsOpen(false)

    // Full page reload to apply the new locale and messages
    window.location.reload()
  }

  // Variant: Flag dropdown (for header - shows current flag, opens dropdown with all flags)
  if (variant === 'flag-dropdown') {
    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title={localeNames[currentLocale]}
        >
          <Flag locale={currentLocale} size={24} />
          <svg
            className={cn('w-3 h-3 text-white/70 transition-transform', isOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-2 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
            <ul role="listbox" className="py-1">
              {locales.map((locale) => (
                <li key={locale}>
                  <button
                    onClick={() => handleLocaleChange(locale)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      currentLocale === locale
                        ? 'bg-forest/10'
                        : 'hover:bg-gray-50'
                    )}
                    role="option"
                    aria-selected={currentLocale === locale}
                  >
                    <Flag locale={locale} size={24} />
                    <span className={cn(
                      'text-sm',
                      currentLocale === locale ? 'text-forest font-medium' : 'text-gray-700'
                    )}>
                      {localeNames[locale]}
                    </span>
                    {currentLocale === locale && (
                      <svg className="w-4 h-4 ml-auto text-forest" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  // Variant: Just flags in a row (for header)
  if (variant === 'flags') {
    return (
      <div className={cn('flex items-center gap-0.5', className)}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-md transition-all',
              currentLocale === locale
                ? 'bg-white/20 scale-110'
                : 'opacity-60 hover:opacity-100 hover:bg-white/10'
            )}
            title={localeNames[locale]}
          >
            <Flag locale={locale} size={20} />
          </button>
        ))}
      </div>
    )
  }

  // Variant: Inline flags (for mobile menu)
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {locales.map((locale) => (
          <button
            key={locale}
            onClick={() => handleLocaleChange(locale)}
            className={cn(
              'px-3 py-2 rounded-lg transition-colors',
              currentLocale === locale
                ? theme === 'dark'
                  ? 'bg-white/20 ring-2 ring-white/50'
                  : 'bg-forest'
                : theme === 'dark'
                  ? 'hover:bg-white/10'
                  : 'hover:bg-gray-100'
            )}
            title={localeNames[locale]}
          >
            <Flag locale={locale} size={24} />
          </button>
        ))}
      </div>
    )
  }

  // Variant: Dropdown (original)
  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Flag locale={currentLocale} size={20} />
        <span className="hidden sm:inline">{localeNames[currentLocale]}</span>
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <ul role="listbox" className="py-1">
            {locales.map((locale) => (
              <li key={locale}>
                <button
                  onClick={() => handleLocaleChange(locale)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors',
                    currentLocale === locale
                      ? 'bg-forest/10 text-forest font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  role="option"
                  aria-selected={currentLocale === locale}
                >
                  <Flag locale={locale} size={20} />
                  <span>{localeNames[locale]}</span>
                  {currentLocale === locale && (
                    <svg className="w-4 h-4 ml-auto text-forest" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
