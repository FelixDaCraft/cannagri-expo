'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { siteConfig } from '@/config/site'
import { useEdition } from '@/components/editions'
import { shortHoursRange } from '@/lib/home/format'
import { formatEditionDate } from '@/lib/editions/format'
import { SocialIcons } from './SocialIcons'

const linkClass =
  'inline-flex min-h-[44px] items-center text-cream/75 transition-colors hover:text-cream md:min-h-[32px]'

function FooterColumn({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="mb-3 font-condensed text-lg font-semibold leading-none text-cream">{title}</h2>
      <ul className="grid gap-0.5">{children}</ul>
    </div>
  )
}

export function Footer() {
  const t = useTranslations('common')
  const tNav = useTranslations('nav')
  const tFooter = useTranslations('footer')
  const edition = useEdition()
  const locale = useLocale()

  const salonLinks = [
    { label: tNav('ourVision'), href: '/evenement' },
    { label: tNav('program'), href: '/programme' },
    { label: tNav('exhibitors'), href: '/exposants' },
    { label: tNav('photoGallery'), href: '/mediatheque' },
    { label: tNav('sponsoring'), href: '/sponsoring' },
  ]

  const legalLinks = [
    { label: tFooter('legal.privacy'), href: '/confidentialite' },
    { label: tFooter('legal.terms'), href: '/mentions-legales' },
    { label: tFooter('legal.cgv'), href: '/cgv' },
  ]

  return (
    <footer className="bg-forest-600 text-cream/75">
      <div className="container-custom pb-10 pt-14 md:pt-16">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo-96.png" alt="" width={44} height={44} className="h-11 w-11" />
              <span className="font-display text-[1.75rem] leading-none text-cream">{siteConfig.name}</span>
            </Link>
            <p className="mt-4 max-w-[24em] text-base leading-relaxed">{tFooter('description')}</p>
            <div className="mt-5">
              <SocialIcons labelTemplate={(network) => tFooter('socialLabel', { network })} />
            </div>
          </div>

          <FooterColumn title={tFooter('salon')}>
            {salonLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </FooterColumn>

          <FooterColumn title={tFooter('visit')}>
            <li className="py-1.5 md:py-1">{edition.venueDisplay}</li>
            <li className="py-1.5 md:py-1">
              {formatEditionDate(edition.startAt, locale) ?? edition.dateDisplay}
              {edition.hoursLabel && <span className="block">{shortHoursRange(edition.hoursLabel)}</span>}
            </li>
            <li>
              <Link href="/billetterie" className={linkClass}>
                {t('tickets')}
              </Link>
            </li>
            <li>
              <Link href="/infos-pratiques" className={linkClass}>
                {tNav('practicalInfo')}
              </Link>
            </li>
          </FooterColumn>

          <FooterColumn title={tFooter('contact')} className="col-span-2 lg:col-span-1">
            <li>
              <a href={`mailto:${siteConfig.contact.email}`} className={linkClass}>
                {siteConfig.contact.email}
              </a>
            </li>
            <li>
              <Link href="/contact" className={linkClass}>
                {tFooter('contactForm')}
              </Link>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-cream/15 pt-6 text-[0.9375rem] md:flex-row md:items-center md:justify-between">
          <p>{tFooter('copyright', { year: new Date().getFullYear() })}</p>
          <ul className="flex flex-wrap gap-x-5">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
