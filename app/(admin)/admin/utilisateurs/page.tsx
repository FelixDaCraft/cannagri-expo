'use client'

import { useState, useEffect } from 'react'
import { DataTable } from '@/components/admin'
import { Button, Badge, Modal } from '@/components/ui'

interface UserParticulier {
  id: string
  email: string
  name: string | null
  image: string | null
  phone: string | null
  emailVerified: Date | null
  createdAt: string
  _count?: {
    accounts: number
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserParticulier[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<UserParticulier | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: 'EDITOR', // Always create as particulier
        }),
      })
      const data = await res.json()

      if (data.success) {
        await fetchUsers()
        setShowForm(false)
        resetForm()
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          ...(formData.password ? { password: formData.password } : {}),
        }),
      })
      const data = await res.json()

      if (data.success) {
        await fetchUsers()
        setShowForm(false)
        setEditingUser(null)
        resetForm()
      } else {
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (user: UserParticulier) => {
    if (!confirm(`Supprimer l'utilisateur "${user.name || user.email}" ?`)) return

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (data.success) {
        await fetchUsers()
      } else {
        alert(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      alert('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
    })
  }

  const openEditForm = (user: UserParticulier) => {
    setEditingUser(user)
    setFormData({
      name: user.name || '',
      email: user.email,
      phone: user.phone || '',
      password: '',
    })
    setShowForm(true)
  }

  const openCreateForm = () => {
    setEditingUser(null)
    resetForm()
    setShowForm(true)
  }

  const handleExport = () => {
    const csv = [
      ['Nom', 'Email', 'Téléphone', 'Email vérifié', 'Date inscription'].join(','),
      ...users.map((u) =>
        [
          u.name || '',
          u.email,
          u.phone || '',
          u.emailVerified ? 'Oui' : 'Non',
          new Date(u.createdAt).toLocaleDateString('fr-FR'),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'utilisateurs-particuliers.csv'
    a.click()
  }

  const columns = [
    {
      key: 'name',
      label: 'Utilisateur',
      sortable: true,
      render: (user: UserParticulier) => (
        <div className="flex items-center gap-3">
          {user.image ? (
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 bg-sage/20 rounded-full flex items-center justify-center text-forest font-bold text-xs">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium">{user.name || 'Sans nom'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (user: UserParticulier) => (
        <span className="text-gray-600">{user.phone || '-'}</span>
      ),
    },
    {
      key: 'provider',
      label: 'Connexion',
      render: (user: UserParticulier) => {
        const hasOAuth = user._count && user._count.accounts > 0
        return (
          <Badge variant={hasOAuth ? 'sage' : 'default'}>
            {hasOAuth ? 'OAuth' : 'Email'}
          </Badge>
        )
      },
    },
    {
      key: 'emailVerified',
      label: 'Email vérifié',
      render: (user: UserParticulier) => (
        <Badge variant={user.emailVerified ? 'sage' : 'default'}>
          {user.emailVerified ? 'Oui' : 'Non'}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Inscription',
      sortable: true,
      render: (user: UserParticulier) => (
        <span className="text-sm text-gray-600">
          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Utilisateurs Particuliers
          </h1>
          <p className="text-gray-600">
            Gérez les comptes des visiteurs du site (les comptes PRO sont gérés dans &quot;Comptes Pro&quot;)
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total particuliers</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Emails vérifiés</p>
          <p className="text-2xl font-bold text-green-600">
            {users.filter((u) => u.emailVerified).length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Via OAuth</p>
          <p className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u._count && u._count.accounts > 0).length}
          </p>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-forest border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          onEdit={openEditForm}
          onDelete={handleDelete}
          onExport={handleExport}
          searchPlaceholder="Rechercher un utilisateur..."
        />
      )}

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingUser(null); resetForm(); }}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur particulier'}
        size="lg"
      >
        <form onSubmit={editingUser ? handleUpdate : handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="email@exemple.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder="06 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {editingUser ? 'Nouveau mot de passe (laisser vide pour ne pas modifier)' : 'Mot de passe *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              minLength={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
              placeholder={editingUser ? '••••••••' : 'Minimum 8 caractères'}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowForm(false); setEditingUser(null); resetForm(); }}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : (editingUser ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
