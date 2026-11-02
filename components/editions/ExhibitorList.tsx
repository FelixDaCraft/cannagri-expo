import { getTranslations } from 'next-intl/server'
import type { Exhibitor } from '@/lib/editions/exhibitors'
import { hostedLogo } from '@/lib/editions/logo'
import { getTranslatedText } from '@/lib/translation'
import { Reveal } from '@/components/ui/Reveal'

const CATEGORY_ORDER = ['PRODUCTEURS', 'MATERIEL', 'LIFESTYLE', 'SERVICE']

/**
 * Stands d'une édition, regroupés par catégorie (pas de filtre à zéro, constat n°19).
 * Logo hébergé sur le site, avec le nom du stand en texte alternatif (constat n°44).
 */
export async function ExhibitorList({ exhibitors, locale, headingLevel = 'h3' }: { exhibitors: Exhibitor[]; locale: string; headingLevel?: 'h2' | 'h3' }) {
  const t = await getTranslations('exhibitors')
  const Heading = headingLevel
  const groups = CATEGORY_ORDER
    .map((category) => ({ category, items: exhibitors.filter((e) => e.category === category) }))
    .concat([{ category: 'other', items: exhibitors.filter((e) => !CATEGORY_ORDER.includes(e.category)) }])
    .filter((group) => group.items.length > 0)

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.category} aria-label={t(`categories.${group.category}`)}>
          {groups.length > 1 && (
            <Heading className="mb-4 font-condensed text-[1.75rem] font-semibold leading-tight text-forest">
              {t(`categories.${group.category}`)} <span className="font-body text-lg font-normal text-ink">({group.items.length})</span>
            </Heading>
          )}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((exhibitor, i) => {
              const logo = hostedLogo(exhibitor.logoUrl)
              const description = getTranslatedText(exhibitor.description, exhibitor.descriptionTranslations, locale)
              return (
                <Reveal as="li" key={`${exhibitor.standNumber}-${exhibitor.id}`} delay={(i % 3) * 60} className="flex gap-4 rounded-2xl border border-forest/15 bg-cream-100 p-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logo} alt={t('logoAlt', { name: exhibitor.name })} width={64} height={64} loading="lazy" decoding="async" className="h-full w-full object-contain p-1" />
                    ) : (
                      <span aria-hidden="true" className="font-display text-3xl text-forest">{exhibitor.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-condensed text-base font-semibold text-gold-ink">{t('stand')} {exhibitor.standNumber}</p>
                    {exhibitor.websiteUrl ? (
                      <a href={exhibitor.websiteUrl} target="_blank" rel="noopener noreferrer" className="font-condensed text-xl font-semibold leading-tight text-forest underline decoration-forest/30 underline-offset-4 hover:decoration-mint">
                        {exhibitor.name}
                        <span className="sr-only"> {t('newTab')}</span>
                      </a>
                    ) : (
                      <p className="font-condensed text-xl font-semibold leading-tight text-forest">{exhibitor.name}</p>
                    )}
                    {description && <p className="mt-1 line-clamp-3 text-[0.9375rem] leading-snug text-ink">{description}</p>}
                  </div>
                </Reveal>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}
