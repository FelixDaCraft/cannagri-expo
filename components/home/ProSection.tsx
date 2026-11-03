'use client'

import { useTranslations } from 'next-intl'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { Reveal } from '@/components/ui/Reveal'
import { useEdition } from '@/components/editions'

/** Bandeau avant le pied de page (25 à 30 % de l'écran), sur fond crème : les sponsors passent par la plaquette */
export function ProSection() {
  const t = useTranslations('home.pro')
  const edition = useEdition()

  return (
    <section className="flex min-h-[25vh] min-h-[25svh] items-center border-t border-forest/10 bg-cream text-forest" aria-labelledby="pro-title">
      <Reveal className="container-custom flex w-full flex-col items-start gap-4 py-8 md:flex-row md:items-center md:justify-between md:gap-10 md:py-10">
        <div>
          <h2 id="pro-title" className="font-display text-[2.25rem] font-normal leading-[.9] text-forest md:text-[3rem]">
            {t('title')}
          </h2>
          <p className="mt-2 max-w-[36em] text-base leading-relaxed text-ink md:text-lg">{t('text', { year: edition.year })}</p>
        </div>
        <ButtonLink href="/sponsoring" size="lg" className="shrink-0">
          {t('cta')}
        </ButtonLink>
      </Reveal>
    </section>
  )
}
