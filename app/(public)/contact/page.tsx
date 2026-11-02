import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { formatVenueAddress } from '@/lib/editions/format'
import { siteConfig } from '@/config/site'
import { PageHeader } from '@/components/ui/PageHeader'
import { ContactForm, type ContactType } from '@/components/contact/ContactForm'

const TYPE_PARAMS: Record<string, ContactType> = { press: 'PRESS', sponsor: 'SPONSOR', exhibitor: 'EXHIBITOR' }

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('contact')
  return { title: t('metaTitle'), description: t('subtitle') }
}

export default async function ContactPage({ searchParams }: { searchParams: { type?: string | string[] } }) {
  const [t, edition] = await Promise.all([getTranslations('contact'), getActiveEditionView()])
  const typeParam = typeof searchParams.type === 'string' ? searchParams.type : ''
  const address = formatVenueAddress(edition.address, edition.city)
  const pressHref = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(t('press.mailSubject'))}`
  const linkClass = 'text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-mint'

  return (
    <>
      <PageHeader title={t('title')} lead={t('subtitle')} />

      <div className="bg-cream py-14 text-forest md:py-20">
        <div className="container-custom grid items-start gap-12 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
          <section aria-labelledby="form-title" className="rounded-2xl border-2 border-forest bg-cream-100 p-6 md:p-8">
            <h2 id="form-title" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('form.title')}</h2>
            <p className="mb-6 mt-2 text-base text-ink">{t('form.required')}</p>
            <ContactForm initialType={TYPE_PARAMS[typeParam] ?? 'GENERAL'} />
          </section>

          <aside className="space-y-10">
            <section aria-labelledby="info-title" className="border-t-2 border-forest pt-5">
              <h2 id="info-title" className="font-condensed text-[1.75rem] font-semibold leading-tight">{t('info.title')}</h2>
              <dl className="mt-3 space-y-4 text-[1.0625rem] text-ink">
                <div>
                  <dt className="font-condensed text-lg font-semibold text-forest">{t('info.email')}</dt>
                  <dd><a href={`mailto:${siteConfig.contact.email}`} className={linkClass}>{siteConfig.contact.email}</a></dd>
                </div>
                <div>
                  <dt className="font-condensed text-lg font-semibold text-forest">{t('info.phone')}</dt>
                  <dd><a href={`tel:${siteConfig.contact.phone.replace(/\s/g, '')}`} className={linkClass}>{siteConfig.contact.phone}</a></dd>
                </div>
                {edition.venueName && (
                  <div>
                    <dt className="font-condensed text-lg font-semibold text-forest">{t('info.address')}</dt>
                    <dd>{edition.venueName}{address && <><br />{address}</>}</dd>
                  </div>
                )}
              </dl>
            </section>

            {/* Presse : une adresse et un lien, plus de cul-de-sac (constat n°16) */}
            <section aria-labelledby="press-title" className="rounded-2xl bg-forest p-6 text-cream">
              <h2 id="press-title" className="font-condensed text-[1.75rem] font-semibold leading-tight text-cream">{t('press.title')}</h2>
              <p className="mt-2 text-[1.0625rem] leading-relaxed text-cream/80">{t('press.description')}</p>
              <a href={pressHref} className="link-underline mt-2 text-cream decoration-cream/50">
                {siteConfig.contact.email}
              </a>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}
