'use client'

import { useState } from 'react'
import { DataTable } from '@/components/admin'
import { Badge, Button, Card, CardContent, Modal, Input } from '@/components/ui'

// Mock data
const mockExhibitors = [
  { id: '1', name: 'CBD Farm France', slug: 'cbd-farm', category: 'Producteur', standNumber: 'A1', isActive: true, websiteUrl: 'https://example.com' },
  { id: '2', name: 'GreenTech Solutions', slug: 'greentech', category: 'Matériel', standNumber: 'B3', isActive: true, websiteUrl: null },
  { id: '3', name: 'Hemp Lifestyle', slug: 'hemp-lifestyle', category: 'Lifestyle', standNumber: 'C5', isActive: true, websiteUrl: 'https://example.com' },
  { id: '4', name: 'Bio CBD Lab', slug: 'bio-cbd-lab', category: 'Producteur', standNumber: null, isActive: false, websiteUrl: null },
]

type Exhibitor = typeof mockExhibitors[0]

const categories = ['Producteur', 'Matériel', 'Lifestyle', 'Services']

const columns = [
  {
    key: 'name',
    label: 'Nom',
    sortable: true,
    render: (exhibitor: Exhibitor) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-sage/20 rounded flex items-center justify-center text-forest font-bold text-xs">
          {exhibitor.name.charAt(0)}
        </div>
        <span className="font-medium">{exhibitor.name}</span>
      </div>
    ),
  },
  {
    key: 'category',
    label: 'Catégorie',
    render: (exhibitor: Exhibitor) => (
      <Badge variant="sage">{exhibitor.category}</Badge>
    ),
  },
  {
    key: 'standNumber',
    label: 'Stand',
    render: (exhibitor: Exhibitor) => exhibitor.standNumber || '-',
  },
  {
    key: 'isActive',
    label: 'Statut',
    render: (exhibitor: Exhibitor) => (
      <Badge variant={exhibitor.isActive ? 'success' : 'default'}>
        {exhibitor.isActive ? 'Actif' : 'Inactif'}
      </Badge>
    ),
  },
]

export default function ExposantsPage() {
  const [exhibitors, setExhibitors] = useState(mockExhibitors)
  const [showForm, setShowForm] = useState(false)
  const [editingExhibitor, setEditingExhibitor] = useState<Exhibitor | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Producteur',
    standNumber: '',
    websiteUrl: '',
    isActive: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingExhibitor) {
      setExhibitors(exhibitors.map((ex) =>
        ex.id === editingExhibitor.id ? { ...ex, ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') } : ex
      ))
    } else {
      const newExhibitor: Exhibitor = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
      }
      setExhibitors([...exhibitors, newExhibitor])
    }
    setShowForm(false)
    setEditingExhibitor(null)
    setFormData({ name: '', category: 'Producteur', standNumber: '', websiteUrl: '', isActive: true })
  }

  const handleEdit = (exhibitor: Exhibitor) => {
    setEditingExhibitor(exhibitor)
    setFormData({
      name: exhibitor.name,
      category: exhibitor.category,
      standNumber: exhibitor.standNumber || '',
      websiteUrl: exhibitor.websiteUrl || '',
      isActive: exhibitor.isActive,
    })
    setShowForm(true)
  }

  const handleDelete = (exhibitor: Exhibitor) => {
    if (!confirm(`Supprimer l'exposant "${exhibitor.name}" ?`)) return
    setExhibitors(exhibitors.filter((ex) => ex.id !== exhibitor.id))
  }

  const handleExport = () => {
    const csv = [
      ['Nom', 'Catégorie', 'Stand', 'Site web', 'Actif'].join(','),
      ...exhibitors.map((ex) =>
        [ex.name, ex.category, ex.standNumber || '', ex.websiteUrl || '', ex.isActive ? 'Oui' : 'Non'].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'exposants.csv'
    a.click()
  }

  const stats = {
    total: exhibitors.length,
    active: exhibitors.filter((ex) => ex.isActive).length,
    withStand: exhibitors.filter((ex) => ex.standNumber).length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Exposants</h1>
          <p className="text-gray-600">Gérez la liste des exposants du salon</p>
        </div>
        <Button onClick={() => { setEditingExhibitor(null); setFormData({ name: '', category: 'Producteur', standNumber: '', websiteUrl: '', isActive: true }); setShowForm(true); }}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel exposant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card variant="default" className="bg-white">
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">Actifs</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-white">
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">Avec stand</p>
            <p className="text-2xl font-bold text-forest">{stats.withStand}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={exhibitors}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
        searchPlaceholder="Rechercher un exposant..."
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingExhibitor(null); }}
        title={editingExhibitor ? 'Modifier l\'exposant' : 'Nouvel exposant'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nom de l'exposant"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <Input
            label="Numéro de stand"
            name="standNumber"
            value={formData.standNumber}
            onChange={(e) => setFormData({ ...formData, standNumber: e.target.value })}
            placeholder="A1, B2..."
          />

          <Input
            label="Site web"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            placeholder="https://..."
          />

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-forest rounded focus:ring-sage"
            />
            <span className="text-sm">Actif (visible sur le site)</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              {editingExhibitor ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
