'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Card, CardContent, Modal } from '@/components/ui'

interface Pro {
  id: string
  email: string
  name: string | null
  firstName: string | null
  companyName: string | null
  phone: string | null
  siret: string | null
  businessType: 'PRODUCTEURS' | 'MATERIEL' | 'LIFESTYLE' | 'SERVICE' | null
  createdAt: string
  _count?: {
    stands: number
  }
}

const businessTypeLabels = {
  PRODUCTEURS: 'Producteurs',
  MATERIEL: 'Matériel',
  LIFESTYLE: 'Lifestyle',
  SERVICE: 'Service',
}

export default function ProsPage() {
  const [pros, setPros] = useState<Pro[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    firstName: '',
    companyName: '',
    phone: '',
    siret: '',
    businessType: '' as Pro['businessType'] | '',
  })

  useEffect(() => {
    fetchPros()
  }, [])

  const fetchPros = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/pros')
      const data = await res.json()
      if (data.data) {
        setPros(data.data)
      }
    } catch (error) {
      console.error('Error fetching pros:', error)
      setMessage({ type: 'error', text: 'Erreur lors du chargement des comptes' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const res = await fetch('/api/admin/pros', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          businessType: formData.businessType || null,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Compte Pro créé avec succès' })
        setShowCreateModal(false)
        setFormData({
          email: '',
          name: '',
          firstName: '',
          companyName: '',
          phone: '',
          siret: '',
          businessType: '',
        })
        fetchPros()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la création' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la création' })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (pro: Pro) => {
    if (!confirm(`Supprimer le compte de ${pro.companyName || pro.email} ?`)) return

    try {
      const res = await fetch(`/api/admin/pros/${pro.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Compte supprimé' })
        fetchPros()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Comptes Professionnels
          </h1>
          <p className="text-gray-600">
            Gérez les comptes des exposants inscrits
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Créer un compte Pro
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
          <button
            className="float-right font-bold"
            onClick={() => setMessage(null)}
          >
            x
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{pros.length}</p>
          </CardContent>
        </Card>
        {Object.entries(businessTypeLabels).map(([key, label]) => (
          <Card key={key} variant="default" className="bg-white">
            <CardContent className="text-center p-4">
              <p className="text-sm text-gray-600">{label}</p>
              <p className="text-2xl font-bold text-forest">
                {pros.filter((p) => p.businessType === key).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : pros.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-500">Aucun compte professionnel</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entreprise
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SIRET
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stands
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {pros.map((pro) => (
                  <tr key={pro.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">
                        {pro.companyName || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <span className="text-gray-900">
                          {pro.firstName} {pro.name}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {pro.email}
                        </span>
                        {pro.phone && (
                          <span className="block text-xs text-gray-500">
                            {pro.phone}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-600 font-mono text-sm">
                        {pro.siret || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {pro.businessType ? (
                        <Badge variant="sage">
                          {businessTypeLabels[pro.businessType]}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-gray-900">
                        {pro._count?.stands || 0}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pro.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pro)}
                        className="text-red-600 hover:text-red-800 hover:border-red-300"
                      >
                        Supprimer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Créer un compte Pro"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;entreprise *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SIRET
              </label>
              <input
                type="text"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d&apos;activité
            </label>
            <select
              value={formData.businessType || ''}
              onChange={(e) => setFormData({ ...formData, businessType: e.target.value as Pro['businessType'] || '' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
            >
              <option value="">Sélectionner...</option>
              {Object.entries(businessTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={creating} className="flex-1">
              {creating ? 'Création...' : 'Créer le compte'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
