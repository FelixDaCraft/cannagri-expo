'use client'

import { useState, useEffect } from 'react'
import { DataTable, SponsorForm } from '@/components/admin'
import { Button, Badge, Modal } from '@/components/ui'
import type { Sponsor, Stand } from '@/types'

// Type étendu pour sponsor avec stand
interface SponsorWithStand extends Sponsor {
  stand: Stand | null
}

// Labels et badges pour les types de sponsors
const sponsorTypeLabels = {
  PLATINE: { label: 'Platine', variant: 'forest' as const },
  OR: { label: 'Or', variant: 'terracotta' as const },
  ARGENT: { label: 'Argent', variant: 'sage' as const },
  BRONZE: { label: 'Bronze', variant: 'default' as const },
}

const columns = [
  {
    key: 'name',
    label: 'Nom',
    sortable: true,
    render: (sponsor: SponsorWithStand) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-sage/20 rounded flex items-center justify-center text-forest font-bold text-xs">
          {sponsor.name.charAt(0)}
        </div>
        <span className="font-medium">{sponsor.name}</span>
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    render: (sponsor: SponsorWithStand) => {
      const typeInfo = sponsorTypeLabels[sponsor.type as keyof typeof sponsorTypeLabels] || { label: sponsor.type, variant: 'default' as const }
      return (
        <Badge variant={typeInfo.variant}>
          {typeInfo.label}
        </Badge>
      )
    },
  },
  {
    key: 'stand',
    label: 'Stand',
    render: (sponsor: SponsorWithStand) => sponsor.stand ? (
      <Badge variant="sage">Stand {sponsor.stand.number}</Badge>
    ) : '-',
  },
  {
    key: 'isActive',
    label: 'Statut',
    render: (sponsor: SponsorWithStand) => (
      <Badge variant={sponsor.isActive ? 'success' : 'default'}>
        {sponsor.isActive ? 'Actif' : 'Inactif'}
      </Badge>
    ),
  },
]

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorWithStand[]>([])
  const [editingSponsor, setEditingSponsor] = useState<SponsorWithStand | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch sponsors from API on mount
  useEffect(() => {
    fetchSponsors()
  }, [])

  const fetchSponsors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/sponsors')
      const result = await response.json()

      if (result.success) {
        setSponsors(result.data)
      } else {
        setError(result.error || 'Erreur lors du chargement des sponsors')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Error fetching sponsors:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Partial<Sponsor>) => {
    try {
      const response = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        setSponsors([...sponsors, result.data])
        setShowForm(false)
      } else {
        alert(result.error || 'Erreur lors de la création du sponsor')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error creating sponsor:', err)
    }
  }

  const handleUpdate = async (data: Partial<Sponsor>) => {
    if (!editingSponsor) return

    try {
      const response = await fetch(`/api/admin/sponsors/${editingSponsor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        setSponsors(sponsors.map((s) => (s.id === editingSponsor.id ? result.data : s)))
        setEditingSponsor(null)
        setShowForm(false)
      } else {
        alert(result.error || 'Erreur lors de la mise à jour du sponsor')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error updating sponsor:', err)
    }
  }

  const handleDelete = async (sponsor: SponsorWithStand) => {
    if (!confirm(`Supprimer le sponsor "${sponsor.name}" ?`)) return

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsor.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setSponsors(sponsors.filter((s) => s.id !== sponsor.id))
      } else {
        alert(result.error || 'Erreur lors de la suppression du sponsor')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error deleting sponsor:', err)
    }
  }

  const handleExport = () => {
    // Simple CSV export
    const csv = [
      ['Nom', 'Type', 'Stand', 'Site web', 'Actif'].join(','),
      ...sponsors.map((s) =>
        [s.name, s.type, s.stand ? `Stand ${s.stand.number}` : '', s.websiteUrl || '', s.isActive ? 'Oui' : 'Non'].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sponsors.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des sponsors...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchSponsors}>Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Sponsors
          </h1>
          <p className="text-gray-600">Gérez les partenaires du salon</p>
        </div>
        <Button onClick={() => { setEditingSponsor(null); setShowForm(true); }}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau sponsor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{sponsors.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Platine</p>
          <p className="text-2xl font-bold text-forest">
            {sponsors.filter((s) => s.type === 'PLATINE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Or</p>
          <p className="text-2xl font-bold text-amber-600">
            {sponsors.filter((s) => s.type === 'OR').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Argent</p>
          <p className="text-2xl font-bold text-gray-500">
            {sponsors.filter((s) => s.type === 'ARGENT').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Bronze</p>
          <p className="text-2xl font-bold text-amber-800">
            {sponsors.filter((s) => s.type === 'BRONZE').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={sponsors}
        columns={columns}
        onEdit={(sponsor) => { setEditingSponsor(sponsor); setShowForm(true); }}
        onDelete={handleDelete}
        onExport={handleExport}
        searchPlaceholder="Rechercher un sponsor..."
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingSponsor(null); }}
        title={editingSponsor ? 'Modifier le sponsor' : 'Nouveau sponsor'}
        size="3xl"
      >
        <SponsorForm
          sponsor={editingSponsor}
          onSubmit={editingSponsor ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingSponsor(null); }}
        />
      </Modal>
    </div>
  )
}
