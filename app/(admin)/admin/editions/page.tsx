'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Modal, Button, Input, Badge } from '@/components/ui'
import { formatEditionDate } from '@/lib/editions/format'
import { toParisDateTimeInput } from '@/lib/editions/form'
import { EDITION_STATUS_LABELS } from '../../EditionSwitcher'

interface Edition {
  id: string
  year: number
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
  startAt: string | null
  endAt: string | null
  venueName: string | null
  address: string | null
  city: string | null
  posterUrl: string | null
  ticketingOpenAt: string | null
  ticketingCloseAt: string | null
  standardTicketPrice: number
  flexTicketPrice: number
  accessTransport: string | null
  accessParking: string | null
  accessInfo: string | null
  ticketInfo: string | null
  archiveSummary: string | null
  _count: { sponsors: number; events: number; stands: number; tickets: number; media: number }
}

type FormState = Record<
  | 'year' | 'startAt' | 'endAt' | 'venueName' | 'address' | 'city' | 'posterUrl'
  | 'ticketingOpenAt' | 'ticketingCloseAt' | 'standardTicketPrice' | 'flexTicketPrice'
  | 'accessTransport' | 'accessParking' | 'accessInfo' | 'ticketInfo' | 'archiveSummary'
  | 'copyStandsFromEditionId',
  string
>

const emptyForm: FormState = {
  year: String(new Date().getFullYear() + 1),
  startAt: '',
  endAt: '',
  venueName: '',
  address: '',
  city: '',
  posterUrl: '',
  ticketingOpenAt: '',
  ticketingCloseAt: '',
  standardTicketPrice: '15',
  flexTicketPrice: '25',
  accessTransport: '',
  accessParking: '',
  accessInfo: '',
  ticketInfo: '',
  archiveSummary: '',
  copyStandsFromEditionId: '',
}

function toForm(edition: Edition): FormState {
  return {
    year: String(edition.year),
    startAt: toParisDateTimeInput(edition.startAt),
    endAt: toParisDateTimeInput(edition.endAt),
    venueName: edition.venueName ?? '',
    address: edition.address ?? '',
    city: edition.city ?? '',
    posterUrl: edition.posterUrl ?? '',
    ticketingOpenAt: toParisDateTimeInput(edition.ticketingOpenAt),
    ticketingCloseAt: toParisDateTimeInput(edition.ticketingCloseAt),
    standardTicketPrice: String(edition.standardTicketPrice),
    flexTicketPrice: String(edition.flexTicketPrice),
    accessTransport: edition.accessTransport ?? '',
    accessParking: edition.accessParking ?? '',
    accessInfo: edition.accessInfo ?? '',
    ticketInfo: edition.ticketInfo ?? '',
    archiveSummary: edition.archiveSummary ?? '',
    copyStandsFromEditionId: '',
  }
}

const NEW_SUCCESSOR = '__new__'

const textareaClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest text-sm'

export default function EditionsPage() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [currentEditionId, setCurrentEditionId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Edition | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  // Remplaçant choisi pour archiver l'édition en ligne : id d'un brouillon, ou NEW_SUCCESSOR
  const [successor, setSuccessor] = useState('')

  const fetchEditions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/editions')
      const data = await res.json()
      if (data.success) {
        setEditions(data.data)
        setCurrentEditionId(data.currentEditionId)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEditions()
  }, [fetchEditions])

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [field]: e.target.value })

  const openCreate = () => {
    const active = editions.find((e) => e.status === 'ACTIVE')
    setEditing(null)
    // Par défaut : reprise du plan de stands de l'édition en ligne
    setForm({ ...emptyForm, copyStandsFromEditionId: active?.id ?? '' })
    setError('')
    setShowForm(true)
  }

  const openEdit = (edition: Edition) => {
    setEditing(edition)
    setSuccessor(editions.find((e) => e.status === 'DRAFT')?.id ?? NEW_SUCCESSOR)
    setForm(toForm(edition))
    setError('')
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { year, copyStandsFromEditionId, ...fields } = form
      const res = await fetch(editing ? `/api/admin/editions/${editing.id}` : '/api/admin/editions', {
        method: editing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? fields : { ...fields, year, copyStandsFromEditionId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'enregistrement')
        return
      }
      setShowForm(false)
      await fetchEditions()
    } finally {
      setSaving(false)
    }
  }

  const handleActivate = async (edition: Edition) => {
    const active = editions.find((e) => e.status === 'ACTIVE')
    const message =
      `Mettre l'édition ${edition.year} en ligne ?\n\n` +
      (active ? `L'édition ${active.year} sera archivée et restera consultable sur /editions/${active.year}.\n` : '') +
      'Le site public affichera immédiatement la date, le lieu, l\'affiche, les sponsors et le programme de ' +
      `${edition.year}, et les billets ${active?.year ?? ''} ne seront plus acceptés à l'entrée.`
    if (!confirm(message)) return

    const res = await fetch(`/api/admin/editions/${edition.id}/activate`, { method: 'POST' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Erreur lors de l\'activation')
      return
    }
    await fetchEditions()
  }

  const nextYear = Math.max(...editions.map((e) => e.year), new Date().getFullYear()) + 1

  const handleArchive = async (edition: Edition) => {
    let body: Record<string, unknown> = {}
    let message = `Archiver l'édition ${edition.year} ?`
    if (edition.status === 'ACTIVE') {
      const draft = editions.find((e) => e.id === successor)
      const successorYear = draft ? draft.year : nextYear
      body = draft ? { successorId: draft.id } : { createSuccessorYear: nextYear }
      message =
        `Archiver l'édition ${edition.year} ?\n\n` +
        `Elle sera consultable dans « Éditions passées » et l'édition ${successorYear} passera en ligne` +
        (draft ? '.' : ' avec date et lieu « à venir » (billetterie fermée).') +
        `\nLes billets ${edition.year} ne seront plus acceptés à l'entrée.`
    }
    if (!confirm(message)) return

    setSaving(true)
    try {
      const res = await fetch(`/api/admin/editions/${edition.id}/archive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'archivage")
        return
      }
      setShowForm(false)
      // L'édition gérée et l'édition en ligne ont pu changer : rechargement complet
      window.location.reload()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (edition: Edition) => {
    if (!confirm(`Supprimer le brouillon ${edition.year} ? Les stands copiés seront supprimés.`)) return
    const res = await fetch(`/api/admin/editions/${edition.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) {
      alert(data.error || 'Erreur lors de la suppression')
      return
    }
    await fetchEditions()
  }

  const handleManage = async (edition: Edition) => {
    await fetch('/api/admin/editions/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editionId: edition.id }),
    })
    window.location.href = '/admin/sponsors'
  }

  if (loading) {
    return <div className="text-gray-500">Chargement...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Éditions</h1>
          <p className="text-gray-600 text-sm mt-1">
            Préparez la prochaine édition en brouillon, puis mettez-la en ligne : la précédente est archivée
            automatiquement et reste consultable publiquement.
          </p>
        </div>
        <Button onClick={openCreate}>+ Nouvelle édition</Button>
      </div>

      <div className="grid gap-4">
        {editions.map((edition) => {
          const status = EDITION_STATUS_LABELS[edition.status]
          return (
            <div
              key={edition.id}
              className={`bg-white rounded-lg border p-5 ${edition.id === currentEditionId ? 'ring-2 ring-forest' : ''}`}
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {edition.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={edition.posterUrl} alt={`Affiche ${edition.year}`} className="w-20 h-28 object-cover rounded border" />
                ) : (
                  <div className="w-20 h-28 rounded border border-dashed flex items-center justify-center text-xs text-gray-400 text-center p-1">
                    Pas d&apos;affiche
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-bold text-gray-900">{edition.year}</h2>
                    <Badge variant={status.variant} size="sm">{status.label}</Badge>
                    {edition.id === currentEditionId && <Badge variant="forest" size="sm">Gérée actuellement</Badge>}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">
                    {formatEditionDate(edition.startAt) ?? 'Date à définir'}
                    {' · '}
                    {edition.venueName ? `${edition.venueName}${edition.city ? `, ${edition.city}` : ''}` : 'Lieu à définir'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Billets {edition.standardTicketPrice} € / Flex {edition.flexTicketPrice} €
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {edition._count.sponsors} sponsors · {edition._count.events} événements · {edition._count.stands} stands ·{' '}
                    {edition._count.tickets} billets · {edition._count.media} photos
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {edition.id !== currentEditionId && (
                    <Button size="sm" variant="outline" onClick={() => handleManage(edition)}>
                      Gérer cette édition
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => openEdit(edition)}>
                    Modifier
                  </Button>
                  {edition.status === 'ARCHIVED' && edition._count.events + edition._count.sponsors + edition._count.stands > 0 && (
                    <Link href={`/editions/${edition.year}`} target="_blank">
                      <Button size="sm" variant="outline">Voir l&apos;archive</Button>
                    </Link>
                  )}
                  {edition.status !== 'ACTIVE' && (
                    <Button size="sm" onClick={() => handleActivate(edition)}>
                      Mettre en ligne
                    </Button>
                  )}
                  {edition.status === 'DRAFT' && (
                    <Button size="sm" variant="outline" onClick={() => handleDelete(edition)}>
                      Supprimer
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? `Modifier l'édition ${editing.year}` : 'Nouvelle édition'}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

          <fieldset className="space-y-4">
            <legend className="font-semibold text-gray-900">Date et lieu</legend>
            {!editing && (
              <Input label="Année" type="number" min={2020} max={2100} value={form.year} onChange={set('year')} required />
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Ouverture (heure de Paris)" type="datetime-local" value={form.startAt} onChange={set('startAt')} />
              <Input label="Fermeture (heure de Paris)" type="datetime-local" value={form.endAt} onChange={set('endAt')} />
            </div>
            <Input label="Lieu" value={form.venueName} onChange={set('venueName')} placeholder="Ex : L'Agronaute" />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Adresse" value={form.address} onChange={set('address')} placeholder="2 Rue du Sénégal, 44200 Nantes" />
              <Input label="Ville" value={form.city} onChange={set('city')} />
            </div>
            <Input
              label="Affiche"
              value={form.posterUrl}
              onChange={set('posterUrl')}
              placeholder="/images/affiche-2027.png"
              helperText="Chemin d'un fichier du site (ex. /images/affiche-2027.png) ou URL https. L'affiche est masquée tant que ce champ est vide."
            />
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="font-semibold text-gray-900">Billetterie</legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Ouverture des ventes" type="datetime-local" value={form.ticketingOpenAt} onChange={set('ticketingOpenAt')} />
              <Input label="Clôture des ventes" type="datetime-local" value={form.ticketingCloseAt} onChange={set('ticketingCloseAt')} />
              <Input label="Prix billet Standard (€)" type="number" min={0} step="0.01" value={form.standardTicketPrice} onChange={set('standardTicketPrice')} required />
              <Input label="Prix billet Flex (€)" type="number" min={0} step="0.01" value={form.flexTicketPrice} onChange={set('flexTicketPrice')} required />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-semibold text-gray-900">Infos pratiques</legend>
            {([
              ['accessTransport', 'Transports'],
              ['accessParking', 'Parking'],
              ['accessInfo', 'Accessibilité'],
              ['ticketInfo', 'Informations billets'],
            ] as const).map(([field, label]) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <textarea rows={3} value={form[field]} onChange={set(field)} className={textareaClass} />
              </div>
            ))}
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="font-semibold text-gray-900">Archive</legend>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bilan affiché sur la page d&apos;archive (optionnel)
              </label>
              <textarea rows={3} value={form.archiveSummary} onChange={set('archiveSummary')} className={textareaClass}
                placeholder="Ex : 1 200 visiteurs, 35 exposants, 8 conférences..." />
            </div>
          </fieldset>

          {editing && (
            <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
              <legend className="font-semibold text-gray-900 px-1">Statut de l&apos;édition</legend>
              {editing.status === 'ARCHIVED' ? (
                <p className="text-sm text-gray-600">
                  Édition archivée. Elle apparaît dans « Éditions passées » dès qu&apos;elle contient des conférences,
                  des sponsors ou des stands vendus.
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    {editing.status === 'ACTIVE'
                      ? "Édition en ligne. Pour l'archiver, choisissez celle qui la remplace sur le site."
                      : 'Brouillon. Archivez-le pour le ranger avec les éditions passées.'}
                  </p>
                  {editing.status === 'ACTIVE' && (
                    <select value={successor} onChange={(e) => setSuccessor(e.target.value)} className={textareaClass}>
                      {editions.filter((e) => e.status === 'DRAFT').map((e) => (
                        <option key={e.id} value={e.id}>Mettre en ligne le brouillon {e.year}</option>
                      ))}
                      <option value={NEW_SUCCESSOR}>Créer l&apos;édition {nextYear} (date et lieu à venir)</option>
                    </select>
                  )}
                  <Button type="button" variant="outline" onClick={() => handleArchive(editing)} disabled={saving}>
                    Archiver l&apos;édition {editing.year}
                  </Button>
                </>
              )}
            </fieldset>
          )}

          {!editing && (
            <fieldset className="space-y-2">
              <legend className="font-semibold text-gray-900">Plan des stands</legend>
              <select value={form.copyStandsFromEditionId} onChange={set('copyStandsFromEditionId')} className={textareaClass}>
                <option value="">Partir d&apos;un plan vide</option>
                {editions.filter((e) => e._count.stands > 0).map((e) => (
                  <option key={e.id} value={e.id}>
                    Reprendre le plan {e.year} ({e._count.stands} stands, tous remis libres)
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500">
                Les sponsors, conférences et codes promo ne sont pas repris : chaque édition repart de zéro.
              </p>
            </fieldset>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1">
              {editing ? 'Enregistrer' : 'Créer en brouillon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
