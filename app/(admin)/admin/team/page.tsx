'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, Button, Input } from '@/components/ui'

interface TeamMember {
  id: string
  email: string
  name: string | null
  firstName: string | null
  role: string
  createdAt: string
}

interface Invitation {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  createdAt: string
  invitedBy: {
    email: string
    name: string | null
  }
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  CONTRIBUTOR: 'Contributeur',
}

const roleDescriptions: Record<string, string> = {
  SUPER_ADMIN: 'Accès total + gestion des rôles et invitations',
  ADMIN: 'Accès total (sauf gestion des rôles)',
  CONTRIBUTOR: 'Accès limité: Comptes Pro et Stands uniquement',
}

const roleBadgeColors: Record<string, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  CONTRIBUTOR: 'bg-orange-100 text-orange-800',
}

export default function TeamPage() {
  const { data: session } = useSession()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [canManageRoles, setCanManageRoles] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Invite form
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('CONTRIBUTOR')
  const [inviting, setInviting] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  // Edit role
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/admin/team')
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members)
        setInvitations(data.invitations || [])
        setCanManageRoles(data.canManageRoles)
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
    fetchTeam()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviting(true)
    setError('')
    setInviteSuccess(null)

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })

      const data = await res.json()

      if (res.ok) {
        if (data.emailSent) {
          setInviteSuccess(`Invitation envoyée par email à ${inviteEmail}`)
        } else {
          setInviteSuccess(`Invitation créée pour ${inviteEmail}. L'email n'a pas pu être envoyé. Lien à partager manuellement: ${data.inviteUrl}`)
        }
        setInviteEmail('')
        setShowInviteForm(false)
        fetchTeam()
      } else {
        setError(data.error || 'Erreur lors de l\'invitation')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateRole = async (memberId: string) => {
    try {
      const res = await fetch(`/api/admin/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        setEditingMember(null)
        fetchTeam()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la mise à jour')
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce membre de l\'équipe ?')) return

    try {
      const res = await fetch(`/api/admin/team/${memberId}?type=member`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchTeam()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de la suppression')
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/admin/team/${invitationId}?type=invitation`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchTeam()
      } else {
        const data = await res.json()
        setError(data.error || 'Erreur lors de l\'annulation')
      }
    } catch {
      setError('Erreur de connexion')
    }
  }

  if (loading) {
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
          <h1 className="text-2xl font-heading font-bold text-forest">Équipe</h1>
          <p className="text-forest/60 mt-1">Gérez les collaborateurs et leurs accès</p>
        </div>
        {canManageRoles && (
          <Button onClick={() => setShowInviteForm(!showInviteForm)}>
            {showInviteForm ? 'Annuler' : 'Inviter un collaborateur'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Fermer</button>
        </div>
      )}

      {inviteSuccess && (
        <div className="bg-green-50 text-green-600 p-4 rounded-lg">
          <p className="font-medium">Invitation créée avec succès !</p>
          <p className="text-sm mt-1 break-all">{inviteSuccess}</p>
          <button onClick={() => setInviteSuccess(null)} className="mt-2 underline text-sm">Fermer</button>
        </div>
      )}

      {/* Invite Form */}
      {showInviteForm && canManageRoles && (
        <Card variant="elevated">
          <CardContent>
            <h2 className="text-lg font-heading font-bold text-forest mb-4">Inviter un collaborateur</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Email</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborateur@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest mb-1">Rôle</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border border-forest/20 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                >
                  <option value="CONTRIBUTOR">Contributeur - Accès Pro & Stands</option>
                  <option value="ADMIN">Administrateur - Accès total</option>
                </select>
                <p className="text-sm text-forest/60 mt-1">{roleDescriptions[inviteRole]}</p>
              </div>
              <Button type="submit" disabled={inviting}>
                {inviting ? 'Envoi en cours...' : 'Envoyer l\'invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Role Legend */}
      <Card variant="default">
        <CardContent>
          <h3 className="font-medium text-forest mb-3">Légende des rôles</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(roleLabels).map(([role, label]) => (
              <div key={role} className="flex items-start gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadgeColors[role]}`}>
                  {label}
                </span>
                <span className="text-xs text-forest/60">{roleDescriptions[role]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card variant="elevated">
        <CardContent>
          <h2 className="text-lg font-heading font-bold text-forest mb-4">
            Membres de l&apos;équipe ({members.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-forest/10">
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Membre</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Rôle</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Membre depuis</th>
                  {canManageRoles && (
                    <th className="text-right py-3 px-4 text-sm font-medium text-forest/60">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b border-forest/5 hover:bg-forest/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center">
                          <span className="text-forest font-medium">
                            {(member.name || member.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-forest">{member.name || 'Sans nom'}</p>
                          {member.id === session?.user?.id && (
                            <span className="text-xs text-terracotta">(Vous)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-forest/80">{member.email}</td>
                    <td className="py-3 px-4">
                      {editingMember === member.id ? (
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="px-2 py-1 border border-forest/20 rounded text-sm"
                        >
                          <option value="CONTRIBUTOR">Contributeur</option>
                          <option value="ADMIN">Administrateur</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadgeColors[member.role]}`}>
                          {roleLabels[member.role]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-forest/60 text-sm">
                      {new Date(member.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    {canManageRoles && (
                      <td className="py-3 px-4 text-right">
                        {member.role !== 'SUPER_ADMIN' && member.id !== session?.user?.id && (
                          <>
                            {editingMember === member.id ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleUpdateRole(member.id)}
                                  className="text-green-600 hover:text-green-800 text-sm"
                                >
                                  Valider
                                </button>
                                <button
                                  onClick={() => setEditingMember(null)}
                                  className="text-gray-600 hover:text-gray-800 text-sm"
                                >
                                  Annuler
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => {
                                    setEditingMember(member.id)
                                    setNewRole(member.role)
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Retirer
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canManageRoles && invitations.length > 0 && (
        <Card variant="elevated">
          <CardContent>
            <h2 className="text-lg font-heading font-bold text-forest mb-4">
              Invitations en attente ({invitations.length})
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-forest/10">
                    <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Rôle</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-forest/60">Expire le</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-forest/60">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id} className="border-b border-forest/5 hover:bg-forest/5">
                      <td className="py-3 px-4 text-forest">{invitation.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${roleBadgeColors[invitation.role]}`}>
                          {roleLabels[invitation.role]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-forest/60 text-sm">
                        {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCancelInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Annuler
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
