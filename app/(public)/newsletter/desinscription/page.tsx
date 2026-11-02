import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { TokenAction } from '@/components/newsletter/TokenAction'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('newsletter.unsubscribe')
  return { title: t('title'), robots: { index: false, follow: false } }
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] bg-cream" />}>
      <TokenAction action="unsubscribe" />
    </Suspense>
  )
}
