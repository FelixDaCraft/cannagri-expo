import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { siteConfig } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { Reveal } from '@/components/ui/Reveal'
import { BrochureForm } from '@/components/sponsoring/BrochureForm'

const BENEFITS = ['visibility', 'notoriety', 'network'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('sponsoring')
  return { title: t('metaTitle'), description: t('subtitle') }
}

export default async function SponsoringPage() {
  const [t, edition] = await Promise.all([getTranslations('sponsoring'), getActiveEditionView()])

  return (
    <>
      <PageHeader eyebrow={t('badge', { year: edition.year })} title={t('title')} lead={t('subtitle')} />

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom grid items-start gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          {/* Le formulaire d'abord : c'est la seule action de la page (constat n°64) */}
          <section aria-labelledby="form-title" className="rounded-2xl border-2 border-forest bg-cream-100 p-6 md:p-8">
            <h2 id="form-title" className="title-display">{t('form.title')}</h2>
            <p className="mb-6 mt-3 text-lg leading-relaxed text-ink">{t('form.subtitle')}</p>
            <BrochureForm />
          </section>

          <div className="space-y-10">
            <Reveal as="section" aria-labelledby="why-title">
              <h2 id="why-title" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('benefits.title')}</h2>
              <ul className="mt-3">
                {BENEFITS.map((key) => (
                  <li key={key} className="border-b border-forest/15 py-4">
                    <h3 className="font-condensed text-xl font-semibold text-forest">{t(`benefits.${key}.title`)}</h3>
                    <p className="mt-1 text-[1.0625rem] leading-relaxed text-ink">{t(`benefits.${key}.description`)}</p>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal as="section" delay={80} aria-labelledby="levels-title">
              <h2 id="levels-title" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('packagesTitle')}</h2>
              <p className="mt-3 text-[1.0625rem] leading-relaxed text-ink">{t('packagesSubtitle')}</p>
            </Reveal>

            <Reveal as="section" delay={120} aria-labelledby="direct-title">
              <h2 id="direct-title" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('alternativeContact.title')}</h2>
              <a href={`mailto:${siteConfig.contact.email}`} className="link-underline text-forest decoration-forest/40">
                {siteConfig.contact.email}
              </a>
            </Reveal>
          </div>
        </div>
      </div>
    </>
  )
}
