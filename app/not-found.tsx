import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import PublicLayout from '@/app/(public)/layout'
import { NotFoundContent } from '@/components/layout/NotFoundContent'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('notFound')
  return { title: t('metaTitle') }
}

/** Adresses inconnues : même en-tête et même pied de page que le reste du site */
export default function NotFound() {
  return (
    <PublicLayout>
      <NotFoundContent />
    </PublicLayout>
  )
}
