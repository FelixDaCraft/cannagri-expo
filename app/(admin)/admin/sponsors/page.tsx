'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DataTable, SponsorForm } from '@/components/admin'
import { Button, Badge, Modal } from '@/components/ui'
import type { Sponsor } from '@/types'

// Mock data
const mockSponsors: Sponsor[] = [
  {
    id: '1',
    name: 'CBD Premium France',
    slug: 'cbd-premium-france',
    type: 'PREMIUM',
    logoUrl: null,
    description: 'Leader français du CBD premium',
    websiteUrl: 'https://example.com',
    standNumber: 'A1',
    articleTitle: 'Innovation CBD 2026',
    articleBody: 'Lorem ipsum...',
    articleImage: null,
    displayOrder: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'GreenTech Solutions',
    slug: 'greentech-solutions',
    type: 'STANDARD',
    logoUrl: null,
    description: 'Solutions de culture innovantes',
    websiteUrl: 'https://example.com',
    standNumber: 'B3',
    articleTitle: null,
    articleBody: null,
    articleImage: null,
    displayOrder: 2,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const columns = [
  {
    key: 'name',
    label: 'Nom',
    sortable: true,
    render: (sponsor: Sponsor) => (
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
    render: (sponsor: Sponsor) => (
      <Badge variant={sponsor.type === 'PREMIUM' ? 'forest' : 'sage'}>
        {sponsor.type}
      </Badge>
    ),
  },
  {
    key: 'standNumber',
    label: 'Stand',
    render: (sponsor: Sponsor) => sponsor.standNumber || '-',
  },
  {
    key: 'isActive',
    label: 'Statut',
    render: (sponsor: Sponsor) => (
      <Badge variant={sponsor.isActive ? 'success' : 'default'}>
        {sponsor.isActive ? 'Actif' : 'Inactif'}
      </Badge>
    ),
  },
]

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState(mockSponsors)
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null)
  const [showForm, setShowForm] = useState(false)

  const handleCreate = async (data: Partial<Sponsor>) => {
    // In production, this would call the API
    const newSponsor: Sponsor = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Sponsor
    setSponsors([...sponsors, newSponsor])
    setShowForm(false)
  }

  const handleUpdate = async (data: Partial<Sponsor>) => {
    if (!editingSponsor) return
    // In production, this would call the API
    setSponsors(sponsors.map((s) => (s.id === editingSponsor.id ? { ...s, ...data } : s)))
    setEditingSponsor(null)
    setShowForm(false)
  }

  const handleDelete = async (sponsor: Sponsor) => {
    if (!confirm(`Supprimer le sponsor "${sponsor.name}" ?`)) return
    // In production, this would call the API
    setSponsors(sponsors.filter((s) => s.id !== sponsor.id))
  }

  const handleExport = () => {
    // Simple CSV export
    const csv = [
      ['Nom', 'Type', 'Stand', 'Site web', 'Actif'].join(','),
      ...sponsors.map((s) =>
        [s.name, s.type, s.standNumber || '', s.websiteUrl || '', s.isActive ? 'Oui' : 'Non'].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sponsors.csv'
    a.click()
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
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{sponsors.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Premium</p>
          <p className="text-2xl font-bold text-forest">
            {sponsors.filter((s) => s.type === 'PREMIUM').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Standard</p>
          <p className="text-2xl font-bold text-sage-700">
            {sponsors.filter((s) => s.type === 'STANDARD').length}
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
        size="xl"
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
