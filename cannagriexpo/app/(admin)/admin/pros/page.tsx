'use client'

import { useState, useEffect } from 'react'
import { Button, Badge, Card, CardContent, Modal } from '@/components/ui'
import { ExhibitorTranslationEditor } from '@/components/admin'

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

interface Pro {
  id: string
  email: string
  name: string | null
  firstName: string | null
  companyName: string | null
  companyDescription: string | null
  companyDescriptionTranslations: Translations | null
  phone: string | null
  siret: string | null
  businessType: 'PRODUCTEURS' | 'MATERIEL' | 'LIFESTYLE' | 'SERVICE' | null
  isApproved: boolean
  createdAt: string
  _count?: {
    stands: number
  }
}

const businessTypeLabels: Record<string, string> = {
  PRODUCTEURS: 'Producteurs',
  MATERIEL: 'Matériel',
  LIFESTYLE: 'Lifestyle',
  SERVICE: 'Service',
}

export default function ProsPage() {
  const [pros, setPros] = useState<Pro[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingPro, setEditingPro] = useState<Pro | null>(null)
  const [translatingPro, setTranslatingPro] = useState<Pro | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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

  const resetForm = () => {
    setFormData({
      email: '',
      name: '',
      firstName: '',
      companyName: '',
      phone: '',
      siret: '',
      businessType: '',
    })
  }

  const openCreateModal = () => {
    setEditingPro(null)
    resetForm()
    setShowModal(true)
  }

  const openEditModal = (pro: Pro) => {
    setEditingPro(pro)
    setFormData({
      email: pro.email,
      name: pro.name || '',
      firstName: pro.firstName || '',
      companyName: pro.companyName || '',
      phone: pro.phone || '',
      siret: pro.siret || '',
      businessType: pro.businessType || '',
    })
    setShowModal(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

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
        setShowModal(false)
        resetForm()
        fetchPros()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la création' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la création' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPro) return
    setIsSaving(true)

    try {
      const res = await fetch(`/api/admin/pros/${editingPro.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || null,
          firstName: formData.firstName || null,
          companyName: formData.companyName || null,
          phone: formData.phone || null,
          siret: formData.siret || null,
          businessType: formData.businessType || null,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Compte Pro mis à jour avec succès' })
        setShowModal(false)
        setEditingPro(null)
        resetForm()
        fetchPros()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (pro: Pro) => {
    if (!confirm(`Supprimer le compte de ${pro.companyName || pro.email} ?\n\nCette action est irréversible.`)) return

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

  const handleToggleApproval = async (pro: Pro) => {
    const newStatus = !pro.isApproved
    const action = newStatus ? 'valider' : 'retirer la validation de'

    if (!confirm(`Voulez-vous ${action} le compte de ${pro.companyName || pro.email} ?`)) return

    try {
      const res = await fetch(`/api/admin/pros/${pro.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: newStatus }),
      })

      if (res.ok) {
        setMessage({
          type: 'success',
          text: newStatus
            ? `Compte ${pro.companyName || pro.email} validé avec succès`
            : `Validation retirée pour ${pro.companyName || pro.email}`
        })
        fetchPros()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
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
        <Button onClick={openCreateModal}>
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
            &times;
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="default" className="bg-white">
          <CardContent className="text-center p-4">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">{pros.length}</p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-green-50 border-green-200">
          <CardContent className="text-center p-4">
            <p className="text-sm text-green-700">Validés</p>
            <p className="text-2xl font-bold text-green-600">
              {pros.filter((p) => p.isApproved).length}
            </p>
          </CardContent>
        </Card>
        <Card variant="default" className="bg-orange-50 border-orange-200">
          <CardContent className="text-center p-4">
            <p className="text-sm text-orange-700">En attente</p>
            <p className="text-2xl font-bold text-orange-600">
              {pros.filter((p) => !p.isApproved).length}
            </p>
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
                    Traductions
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inscription
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut PRO
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
                    <td className="px-4 py-4 whitespace-nowrap">
                      {pro.companyDescription ? (
                        <button
                          onClick={() => setTranslatingPro(pro)}
                          className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                        >
                          {pro.companyDescriptionTranslations && Object.keys(pro.companyDescriptionTranslations).length > 0 ? (
                            <Badge variant="success">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                              </svg>
                              Traduit
                            </Badge>
                          ) : (
                            <Badge variant="default">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                              </svg>
                              Traduire
                            </Badge>
                          )}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">Pas de description</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(pro.createdAt)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {pro.isApproved ? (
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant="sage" className="bg-green-100 text-green-800">
                            Validé
                          </Badge>
                          <button
                            onClick={() => handleToggleApproval(pro)}
                            className="text-xs text-gray-500 hover:text-red-600 underline"
                          >
                            Retirer
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleApproval(pro)}
                          className="text-green-600 hover:text-green-800 hover:border-green-300 hover:bg-green-50"
                        >
                          Valider
                        </Button>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(pro)}
                          className="p-2 text-gray-600 hover:text-forest hover:bg-gray-100 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(pro)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingPro(null); resetForm(); }}
        title={editingPro ? 'Modifier le compte Pro' : 'Créer un compte Pro'}
      >
        <form onSubmit={editingPro ? handleUpdate : handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom {!editingPro && '*'}
              </label>
              <input
                type="text"
                required={!editingPro}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom {!editingPro && '*'}
              </label>
              <input
                type="text"
                required={!editingPro}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email {!editingPro && '*'}
            </label>
            <input
              type="email"
              required={!editingPro}
              disabled={!!editingPro}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest ${editingPro ? 'bg-gray-100 text-gray-500' : ''}`}
            />
            {editingPro && (
              <p className="text-xs text-gray-500 mt-1">L&apos;email ne peut pas être modifié</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;entreprise {!editingPro && '*'}
            </label>
            <input
              type="text"
              required={!editingPro}
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
              onClick={() => { setShowModal(false); setEditingPro(null); resetForm(); }}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving} className="flex-1">
              {isSaving ? 'Enregistrement...' : (editingPro ? 'Modifier' : 'Créer le compte')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Translation Modal */}
      <Modal
        isOpen={!!translatingPro}
        onClose={() => setTranslatingPro(null)}
        title="Gestion des traductions"
        size="3xl"
      >
        {translatingPro && (
          <ExhibitorTranslationEditor
            proId={translatingPro.id}
            companyName={translatingPro.companyName || 'Exposant'}
            companyDescription={translatingPro.companyDescription}
            companyDescriptionTranslations={translatingPro.companyDescriptionTranslations}
            onClose={() => setTranslatingPro(null)}
            onSave={() => fetchPros()}
          />
        )}
      </Modal>
    </div>
  )
}
