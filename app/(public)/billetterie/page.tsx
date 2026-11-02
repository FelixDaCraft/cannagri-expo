import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { BilletterieView } from '@/components/tickets'
import { parseTicketSelection } from '@/lib/editions/tickets'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('tickets')
  return { title: t('metaTitle') }
}

// /billetterie?standard=<n>&flex=<n> : quantités pré-remplies (bornées, valeurs invalides ignorées)
export default function BilletteriePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return <BilletterieView initialSelection={parseTicketSelection(searchParams)} />
}
