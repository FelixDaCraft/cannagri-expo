import { BilletterieView } from '@/components/tickets'
import { parseTicketSelection } from '@/lib/editions/tickets'

// /billetterie?standard=<n>&flex=<n> : quantités pré-remplies (bornées, valeurs invalides ignorées)
export default function BilletteriePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  return <BilletterieView initialSelection={parseTicketSelection(searchParams)} />
}
