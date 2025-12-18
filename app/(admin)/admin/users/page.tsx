'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, Button, Input } from '@/components/ui'

interface User {
  id: string
  email: string
  name: string | null
  firstName: string | null
  image: string | null
  role: string
  isApproved: boolean
  companyName: string | null
  phone: string | null
  businessType: string | null
  emailVerified: string | null
  authProvider: string
  createdAt: string
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const roleLabels: Record<string, string> = {
  USER: 'Visiteur',
  PRO: 'Professionnel',
  CONTRIBUTOR: 'Contributeur',
  ADMIN: 'Administrateur',
  SUPER_ADMIN: 'Super Admin',
}

const roleBadgeColors: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-800',
  PRO: 'bg-green-100 text-green-800',
  CONTRIBUTOR: 'bg-orange-100 text-orange-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
}

const providerIcons: Record<string, string> = {
  google: 'G',
  apple: '',
  email: '@',
}

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [canManageUsers, setCanManageUsers] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Filtres
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal d'édition
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editRole, setEditRole] = useState('')
  const [editApproved, setEditApproved] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      params.set('page', currentPage.toString())
      params.set('limit', '20')

      const res = await fetch(`/api/admin/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
        setPagination(data.pagination)
        setCanManageUsers(data.canManageUsers)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors du chargement')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setEditRole(user.role)
    setEditApproved(user.isApproved)
  }

  const handleSaveUser = async () => {
    if (!editingUser) return

    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: editRole,
          isApproved: editApproved,
        }),
      })

      if (res.ok) {
        setSuccess('Utilisateur mis a jour')
        setEditingUser(null)
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la mise a jour')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Etes-vous sur de vouloir supprimer l'utilisateur "${userName}" ? Cette action est irreversible.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Utilisateur supprime')
        fetchUsers()
        setTimeout(() => setSuccess(''), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-forest">Utilisateurs</h1>
          <p className="text-forest/60 mt-1">
            Gerez les comptes visiteurs et professionnels inscrits
          </p>
        </div>
        {pagination && (
          <div className="text-sm text-forest/60">
            {pagination.total} utilisateur{pagination.total > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">
          {success}
        </div>
      )}

      {/* Filtres */}
      <Card variant="default">
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par email, nom ou entreprise..."
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
            >
              <option value="">Tous les roles</option>
              <option value="USER">Visiteurs</option>
              <option value="PRO">Professionnels</option>
            </select>
            <Button type="submit">Rechercher</Button>
          </form>
        </CardContent>
      </Card>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-forest">{pagination?.total || 0}</p>
            <p className="text-sm text-forest/60">Total</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-gray-600">
              {users.filter(u => u.role === 'USER').length}
            </p>
            <p className="text-sm text-forest/60">Visiteurs</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {users.filter(u => u.role === 'PRO').length}
            </p>
            <p className="text-sm text-forest/60">Pros</p>
          </CardContent>
        </Card>
        <Card variant="elevated">
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {users.filter(u => u.authProvider !== 'email').length}
            </p>
            <p className="text-sm text-forest/60">OAuth</p>
          </CardContent>
        </Card>
      </div>

      {/* Liste des utilisateurs */}
      <Card variant="elevated">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Utilisateur</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Auth</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Statut</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Inscription</th>
                  {canManageUsers && (
                    <th className="text-right py-3 px-4 text-sm font-medium text-forest/60">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-forest/5 hover:bg-forest/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center overflow-hidden">
                          {user.image ? (
                            <img src={user.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-forest font-medium">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-forest">{user.name || 'Sans nom'}</p>
                          {user.companyName && (
                            <p className="text-xs text-forest/60">{user.companyName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-forest/80 text-sm">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadgeColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        user.authProvider === 'google'
                          ? 'bg-red-100 text-red-600'
                          : user.authProvider === 'apple'
                          ? 'bg-gray-800 text-white'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {providerIcons[user.authProvider] || user.authProvider.charAt(0).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {user.role === 'PRO' ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.isApproved ? 'Approuve' : 'En attente'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          Actif
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-forest/60 text-sm">
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    {canManageUsers && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-forest/10">
              <p className="text-sm text-forest/60">
                Page {pagination.page} sur {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Precedent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={currentPage === pagination.totalPages}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal d'edition */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent>
              <h2 className="text-xl font-heading font-bold text-forest mb-4">
                Modifier l&apos;utilisateur
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-forest/60 mb-1">Email</p>
                  <p className="font-medium">{editingUser.email}</p>
                </div>

                <div>
                  <p className="text-sm text-forest/60 mb-1">Nom</p>
                  <p className="font-medium">{editingUser.name || 'Non renseigne'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest mb-1">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full px-4 py-2 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                  >
                    <option value="USER">Visiteur</option>
                    <option value="PRO">Professionnel</option>
                    <option value="CONTRIBUTOR">Contributeur</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                {editRole === 'PRO' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editApproved}
                        onChange={(e) => setEditApproved(e.target.checked)}
                        className="rounded border-forest/30 text-forest focus:ring-forest"
                      />
                      <span className="text-sm text-forest">Compte professionnel approuve</span>
                    </label>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleSaveUser} disabled={saving}>
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingUser(null)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
