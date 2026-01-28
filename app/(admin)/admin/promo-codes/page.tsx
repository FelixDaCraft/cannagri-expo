'use client'

import { useState, useEffect, useCallback } from 'react'
import { Modal, Button, Input, Badge } from '@/components/ui'

interface PromoCode {
  id: string
  code: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT'
  value: number
  maxUses: number | null
  currentUses: number
  validFrom: string
  validUntil: string
  isActive: boolean
  createdAt: string
  _count: { orders: number }
}

const emptyForm = {
  code: '',
  type: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
  value: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
}

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<PromoCode | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchPromoCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promo-codes')
      const data = await res.json()
      if (data.success) setPromoCodes(data.data)
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors du chargement' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPromoCodes() }, [fetchPromoCodes])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (pc: PromoCode) => {
    setEditing(pc)
    setForm({
      code: pc.code,
      type: pc.type,
      value: String(pc.value),
      maxUses: pc.maxUses !== null ? String(pc.maxUses) : '',
      validFrom: pc.validFrom.slice(0, 16),
      validUntil: pc.validUntil.slice(0, 16),
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const url = editing
        ? `/api/admin/promo-codes/${editing.id}`
        : '/api/admin/promo-codes'
      const method = editing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Erreur' })
        return
      }

      setMessage({ type: 'success', text: editing ? 'Code promo modifié' : 'Code promo créé' })
      setShowForm(false)
      fetchPromoCodes()
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (pc: PromoCode) => {
    try {
      const res = await fetch(`/api/admin/promo-codes/${pc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !pc.isActive }),
      })

      if (res.ok) {
        fetchPromoCodes()
        setMessage({
          type: 'success',
          text: pc.isActive ? 'Code promo désactivé' : 'Code promo activé',
        })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur' })
    }
  }

  const handleDelete = async (pc: PromoCode) => {
    if (!confirm(`Supprimer le code promo "${pc.code}" ?`)) return

    try {
      const res = await fetch(`/api/admin/promo-codes/${pc.id}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Code promo supprimé' })
        fetchPromoCodes()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const isExpired = (pc: PromoCode) => new Date(pc.validUntil) < new Date()
  const isNotYetValid = (pc: PromoCode) => new Date(pc.validFrom) > new Date()

  const getStatus = (pc: PromoCode) => {
    if (!pc.isActive) return { label: 'Inactif', variant: 'error' as const }
    if (isExpired(pc)) return { label: 'Expiré', variant: 'warning' as const }
    if (isNotYetValid(pc)) return { label: 'À venir', variant: 'info' as const }
    if (pc.maxUses !== null && pc.currentUses >= pc.maxUses) return { label: 'Épuisé', variant: 'warning' as const }
    return { label: 'Actif', variant: 'success' as const }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  // Stats
  const activeCount = promoCodes.filter(pc => pc.isActive && !isExpired(pc)).length
  const totalUsages = promoCodes.reduce((sum, pc) => sum + pc.currentUses, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-forest">Codes Promo</h1>
        <Button onClick={openCreate}>+ Nouveau code</Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Total codes</p>
          <p className="text-2xl font-bold text-forest">{promoCodes.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Codes actifs</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <p className="text-sm text-gray-500">Utilisations totales</p>
          <p className="text-2xl font-bold text-blue-600">{totalUsages}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun code promo. Cliquez sur &quot;+ Nouveau code&quot; pour en créer un.
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-medium">Code</th>
                <th className="text-left px-4 py-3 font-medium">Réduction</th>
                <th className="text-left px-4 py-3 font-medium">Utilisations</th>
                <th className="text-left px-4 py-3 font-medium">Validité</th>
                <th className="text-left px-4 py-3 font-medium">Statut</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map(pc => {
                const status = getStatus(pc)
                return (
                  <tr key={pc.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono font-bold">{pc.code}</td>
                    <td className="px-4 py-3">
                      {pc.type === 'PERCENTAGE' ? `${pc.value}%` : `${pc.value} €`}
                    </td>
                    <td className="px-4 py-3">
                      {pc.currentUses}{pc.maxUses !== null ? ` / ${pc.maxUses}` : ' / ∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(pc.validFrom)} → {formatDate(pc.validUntil)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={
                        status.variant === 'success' ? 'forest'
                        : status.variant === 'error' ? 'error'
                        : status.variant === 'warning' ? 'warning'
                        : 'info'
                      }>
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleActive(pc)}
                        className={`text-xs px-2 py-1 rounded ${
                          pc.isActive
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {pc.isActive ? 'Désactiver' : 'Activer'}
                      </button>
                      <button
                        onClick={() => openEdit(pc)}
                        className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(pc)}
                        className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Modifier le code promo' : 'Nouveau code promo'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code"
            name="code"
            value={form.code}
            onChange={e => setForm({ ...form, code: e.target.value })}
            placeholder="Ex: EXPO2026"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction</label>
            <select
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
            >
              <option value="PERCENTAGE">Pourcentage (%)</option>
              <option value="FIXED_AMOUNT">Montant fixe (€)</option>
            </select>
          </div>

          <Input
            label={form.type === 'PERCENTAGE' ? 'Valeur (%)' : 'Valeur (€)'}
            name="value"
            type="number"
            step={form.type === 'PERCENTAGE' ? '1' : '0.01'}
            min="0"
            max={form.type === 'PERCENTAGE' ? '100' : undefined}
            value={form.value}
            onChange={e => setForm({ ...form, value: e.target.value })}
            required
          />

          <Input
            label="Nombre max d'utilisations (vide = illimité)"
            name="maxUses"
            type="number"
            min="1"
            value={form.maxUses}
            onChange={e => setForm({ ...form, maxUses: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Valide à partir du"
              name="validFrom"
              type="datetime-local"
              value={form.validFrom}
              onChange={e => setForm({ ...form, validFrom: e.target.value })}
              required
            />
            <Input
              label="Valide jusqu'au"
              name="validUntil"
              type="datetime-local"
              value={form.validUntil}
              onChange={e => setForm({ ...form, validUntil: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1">
              {editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
