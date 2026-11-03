'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Reveal } from '@/components/ui/Reveal'
import { useEdition } from '@/components/editions'
import { formatEventTime } from '@/lib/editions/format'
import { shortHour } from '@/lib/home/format'

/** Le déroulé connu de la journée ; le détail des conférences viendra sur la page Programme */
export function ProgramHighlight() {
  const t = useTranslations('home.program')
  const edition = useEdition()
  const opening = edition.startAt ? shortHour(formatEventTime(edition.startAt)) : t('morning')
  const closing = edition.endAt ? shortHour(formatEventTime(edition.endAt)) : t('evening')

  const rows = [
    { when: opening, title: t('rows.opening.title'), detail: t('rows.opening.detail') },
    { when: t('allDay'), title: t('rows.talks.title'), detail: t('rows.talks.detail') },
    { when: t('endOfDay'), title: t('rows.cup.title'), detail: t('rows.cup.detail') },
    { when: closing, title: t('rows.closing.title') },
  ]

  return (
    <section className="border-t border-forest/10 bg-cream py-[4.5rem] text-forest md:py-24" aria-labelledby="programme-title">
      <div className="container-custom grid items-end gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <h2 id="programme-title" className="font-display text-[3.75rem] font-normal leading-[.85] text-forest md:text-[5.5rem]">
            {t('title')}
          </h2>
          <p className="mt-5 max-w-[30em] text-[1.1875rem] leading-relaxed text-ink">{t('intro', { year: edition.year })}</p>
          <Link href="/programme" className="link-underline mt-4 text-forest decoration-forest/40">
            {t('viewFullProgram')}
          </Link>
        </Reveal>

        <Reveal delay={100} className="rounded-2xl border-2 border-forest p-6 md:p-8">
          <ol>
            {rows.map((row) => (
              <li
                key={row.title}
                className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-forest/15 py-4 font-condensed first:pt-0 last:border-b-0 md:grid-cols-[7.5rem_1fr]"
              >
                <span className="text-[1.375rem] font-semibold leading-tight text-gold-ink">{row.when}</span>
                <span className="text-[1.375rem] font-semibold leading-tight">
                  {row.title}
                  {row.detail && (
                    <span className="mt-1 block font-body text-base font-normal leading-snug text-ink">{row.detail}</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2 text-[0.9375rem] text-ink">{t('note')}</p>
        </Reveal>
      </div>
    </section>
  )
}
