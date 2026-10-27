'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui'

export interface EditionOption {
  id: string
  year: number
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
}

export const EDITION_STATUS_LABELS: Record<EditionOption['status'], { label: string; variant: 'warning' | 'success' | 'default' }> = {
  DRAFT: { label: 'Brouillon', variant: 'warning' },
  ACTIVE: { label: 'En ligne', variant: 'success' },
  ARCHIVED: { label: 'Archivée', variant: 'default' },
}

/**
 * Choix de l'édition gérée dans l'administration (sponsors, programme, stands, billetterie...).
 * Permet de préparer une édition en brouillon pendant que la précédente est en ligne.
 */
export function EditionSwitcher({ editions, currentId }: { editions: EditionOption[]; currentId: string }) {
  const [saving, setSaving] = useState(false)
  const current = editions.find((e) => e.id === currentId)

  const handleChange = async (editionId: string) => {
    setSaving(true)
    const res = await fetch('/api/admin/editions/select', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ editionId }),
    })
    if (res.ok) {
      // Les pages admin chargent leurs données au montage : rechargement complet
      window.location.reload()
    } else {
      setSaving(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="admin-edition" className="text-sm text-gray-600 hidden sm:inline">
        Édition gérée
      </label>
      <select
        id="admin-edition"
        value={currentId}
        disabled={saving}
        onChange={(e) => handleChange(e.target.value)}
        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-forest focus:border-forest"
      >
        {editions.map((edition) => (
          <option key={edition.id} value={edition.id}>
            {edition.year} · {EDITION_STATUS_LABELS[edition.status].label}
          </option>
        ))}
      </select>
      {current && current.status !== 'ACTIVE' && (
        <Badge variant={EDITION_STATUS_LABELS[current.status].variant} size="sm">
          {current.status === 'DRAFT' ? 'Non visible du public' : 'Édition passée'}
        </Badge>
      )}
    </div>
  )
}
