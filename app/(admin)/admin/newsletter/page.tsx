'use client'

import { useEffect, useState } from 'react'
import { Badge, Card, CardContent } from '@/components/ui'
import { buttonClasses } from '@/components/ui/ButtonLink'

interface Subscriber {
  id: string
  email: string
  name: string | null
  source: string | null
  locale: string | null
  subscribedAt: string
  confirmedAt: string | null
}

const SOURCE_LABELS: Record<string, string> = {
  footer: 'Pied de page',
  programme: 'Page Programme',
  billetterie: 'Achat de billet',
  inscription: 'Création de compte',
  autre: 'Autre',
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' }).format(new Date(value))

export default function NewsletterAdminPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [pending, setPending] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/admin/newsletter')
      .then(async (res) => {
        if (!res.ok) throw new Error()
        const data = await res.json()
        setSubscribers(data.data)
        setPending(data.pending)
      })
      .catch(() => setError('Impossible de charger les abonnés.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-condensed text-3xl font-semibold text-forest">Newsletter</h1>
          <p className="mt-1 text-ink">
            {subscribers.length} abonné{subscribers.length > 1 ? 's' : ''} actif{subscribers.length > 1 ? 's' : ''}
            {pending > 0 && ` · ${pending} en attente de confirmation`}
          </p>
        </div>
        <a href="/api/admin/newsletter?format=csv" className={buttonClasses({ size: 'sm' })}>
          Exporter en CSV
        </a>
      </div>

      <p className="text-sm text-ink">
        Double opt-in : une adresse n&apos;apparaît ici qu&apos;après avoir cliqué sur le lien de confirmation. Les
        inscrits sans date de confirmation datent d&apos;avant la mise en place du double opt-in.
      </p>

      {error && <p role="alert" className="notice-error">{error}</p>}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          {loading ? (
            <p className="p-6 text-ink">Chargement…</p>
          ) : subscribers.length === 0 ? (
            <p className="p-6 text-ink">Aucun abonné actif pour le moment.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-forest/15 font-condensed text-base text-forest">
                <tr>
                  <th scope="col" className="px-4 py-3">E-mail</th>
                  <th scope="col" className="px-4 py-3">Origine</th>
                  <th scope="col" className="px-4 py-3">Langue</th>
                  <th scope="col" className="px-4 py-3">Inscrit le</th>
                  <th scope="col" className="px-4 py-3">Confirmé le</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-forest/10 last:border-0">
                    <td className="px-4 py-3 font-medium text-forest">
                      {s.email}
                      {s.name && <span className="block text-ink">{s.name}</span>}
                    </td>
                    <td className="px-4 py-3 text-ink">{SOURCE_LABELS[s.source ?? ''] ?? '—'}</td>
                    <td className="px-4 py-3 uppercase text-ink">{s.locale ?? '—'}</td>
                    <td className="px-4 py-3 text-ink">{formatDate(s.subscribedAt)}</td>
                    <td className="px-4 py-3">
                      {s.confirmedAt ? <span className="text-ink">{formatDate(s.confirmedAt)}</span> : <Badge size="sm">Avant double opt-in</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
