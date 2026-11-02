'use client'

import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { useEdition } from '@/components/editions'

/** Dernière section avant le pied de page, sur fond crème : les sponsors passent par la plaquette */
export function ProSection() {
  const t = useTranslations('home.pro')
  const edition = useEdition()

  return (
    <section className="screen-section border-t border-forest/10 bg-cream text-forest" aria-labelledby="pro-title">
      <Reveal className="container-custom flex flex-col items-start gap-6 py-14 md:flex-row md:items-center md:justify-between md:gap-10 md:py-16">
        <div>
          <h2 id="pro-title" className="font-display text-[3rem] font-normal leading-[.9] text-forest md:text-[4rem]">
            {t('title')}
          </h2>
          <p className="mt-3 max-w-[32em] text-lg leading-relaxed text-ink">{t('text', { year: edition.year })}</p>
        </div>
        <ButtonLink href="/sponsoring" size="lg" className="shrink-0">
          {t('cta')}
        </ButtonLink>
      </Reveal>
    </section>
  )
}
