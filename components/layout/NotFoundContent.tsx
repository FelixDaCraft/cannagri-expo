import { getTranslations } from 'next-intl/server'
import { ButtonLink } from '@/components/ui/ButtonLink'

/** Page introuvable aux couleurs du site : la mascotte et deux sorties (constats n°34 et 35) */
export async function NotFoundContent() {
  const t = await getTranslations('notFound')
  return (
    <section className="bg-forest text-cream" aria-labelledby="not-found-title">
      <div className="container-custom grid items-center gap-10 py-16 md:grid-cols-[1fr_auto] md:py-24">
        <div>
          <p className="font-condensed text-lg font-semibold text-mint">{t('code')}</p>
          <h1 id="not-found-title" className="mt-3 font-display text-[3.25rem] font-normal leading-[.85] text-cream md:text-[5rem]">
            {t('title')}
          </h1>
          <p className="mt-3 font-accent text-[1.75rem] text-mint">{t('annotation')}</p>
          <p className="mt-5 max-w-[32em] text-lg leading-relaxed text-cream/80">{t('text')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/billetterie" size="lg">{t('tickets')}</ButtonLink>
            <ButtonLink href="/" size="lg" tone="outline-cream">{t('home')}</ButtonLink>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/hero-personnage-480.webp"
          alt=""
          width={480}
          height={693}
          className="mx-auto h-auto w-[220px] md:w-[300px]"
        />
      </div>
    </section>
  )
}
