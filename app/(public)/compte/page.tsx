'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, Badge, Button } from '@/components/ui'

const businessTypeLabels: Record<string, string> = {
  PRODUCTEURS: 'Producteurs',
  MATERIEL: 'Matériel agricole',
  LIFESTYLE: 'Lifestyle & Bien-être',
  SERVICE: 'Services',
}

interface UserProfile {
  id: string
  email: string
  name: string | null
  phone: string | null
  companyName: string | null
  companyDescription: string | null
  companyLogo: string | null
  companyWebsite: string | null
  siret: string | null
  businessType: string | null
  role: string
  isApproved: boolean
  createdAt: string
}

export default function ComptePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    companyName: '',
    businessType: '',
  })

  const [showProRequest, setShowProRequest] = useState(false)
  const [proFormData, setProFormData] = useState({
    companyName: '',
    siret: '',
    businessType: '',
  })

  // State for PRO profile editing (description, logo & website)
  const [editProProfile, setEditProProfile] = useState(false)
  const [proProfileData, setProProfileData] = useState({
    companyDescription: '',
    companyLogo: '',
    companyWebsite: '',
  })
  const [savingProProfile, setSavingProProfile] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  useEffect(() => {
    // Handle message from URL params
    const urlMessage = searchParams.get('message')
    if (urlMessage === 'pro-pending') {
      setMessage({
        type: 'info',
        text: 'Votre demande de compte professionnel a bien été enregistrée. Elle sera validée par notre équipe dans les plus brefs délais.'
      })
    }
  }, [searchParams])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion?callbackUrl=/compte')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/account/profile')
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
        setFormData({
          name: data.data.name || '',
          phone: data.data.phone || '',
          companyName: data.data.companyName || '',
          businessType: data.data.businessType || '',
        })
        setProFormData({
          companyName: data.data.companyName || '',
          siret: data.data.siret || '',
          businessType: data.data.businessType || '',
        })
        setProProfileData({
          companyDescription: data.data.companyDescription || '',
          companyLogo: data.data.companyLogo || '',
          companyWebsite: data.data.companyWebsite || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(data.data)
        setEditMode(false)
        setMessage({ type: 'success', text: 'Profil mis à jour avec succès' })
        // Update session
        await update()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setSaving(false)
    }
  }

  const handleProRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    if (!proFormData.companyName || !proFormData.siret || !proFormData.businessType) {
      setMessage({ type: 'error', text: 'Tous les champs sont requis pour la demande PRO' })
      setSaving(false)
      return
    }

    try {
      const res = await fetch('/api/account/request-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proFormData),
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(data.data)
        setShowProRequest(false)
        setMessage({
          type: 'success',
          text: 'Votre demande de compte professionnel a été envoyée. Elle sera validée par notre équipe.'
        })
        // Update session
        await update()
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la demande' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la demande' })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProProfile(true)
    setMessage(null)

    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profile?.name,
          phone: profile?.phone,
          companyName: profile?.companyName,
          companyDescription: proProfileData.companyDescription,
          companyLogo: proProfileData.companyLogo,
          companyWebsite: proProfileData.companyWebsite,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setProfile(data.data)
        setEditProProfile(false)
        setMessage({ type: 'success', text: 'Profil entreprise mis à jour avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la mise à jour' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' })
    } finally {
      setSavingProProfile(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou GIF.' })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Le fichier est trop volumineux. Maximum 2 Mo.' })
      return
    }

    setUploadingLogo(true)
    setMessage(null)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const res = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok) {
        setProProfileData({ ...proProfileData, companyLogo: data.logoUrl })
        setProfile(prev => prev ? { ...prev, companyLogo: data.logoUrl } : prev)
        setMessage({ type: 'success', text: 'Logo uploadé avec succès' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'upload' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload du logo' })
    } finally {
      setUploadingLogo(false)
      // Reset input
      e.target.value = ''
    }
  }

  const handleDeleteLogo = async () => {
    if (!confirm('Supprimer le logo ?')) return

    try {
      const res = await fetch('/api/upload/logo', { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        setProProfileData({ ...proProfileData, companyLogo: '' })
        setProfile(prev => prev ? { ...prev, companyLogo: null } : prev)
        setMessage({ type: 'success', text: 'Logo supprimé' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la suppression' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de la suppression' })
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const isPro = profile?.role === 'PRO'
  const isApproved = profile?.isApproved
  const canRequestPro = profile?.role !== 'PRO' && profile?.role !== 'ADMIN'

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-heading font-bold text-heading mb-2">
              Mon compte
            </h1>
            <p className="text-body/70">
              Gérez vos informations personnelles
            </p>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
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

          {/* PRO Status Card */}
          {isPro && (
            <Card className={isApproved ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isApproved ? 'bg-green-200' : 'bg-orange-200'
                    }`}>
                      {isApproved ? (
                        <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold ${isApproved ? 'text-green-800' : 'text-orange-800'}`}>
                        Compte Professionnel
                      </h3>
                      <p className={`text-sm ${isApproved ? 'text-green-600' : 'text-orange-600'}`}>
                        {isApproved
                          ? 'Votre compte est validé. Vous avez accès à l\'Espace Pro.'
                          : 'Votre demande est en cours de validation par notre équipe.'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={isApproved ? 'sage' : 'terracotta'}>
                    {isApproved ? 'Validé' : 'En attente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* PRO Company Profile Card - Only for approved PRO users */}
          {isPro && isApproved && (
            <Card className="border-forest/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-heading font-semibold text-forest">Profil Exposant</h2>
                    <p className="text-sm text-gray-600">Ces informations apparaîtront sur la page Exposants du site</p>
                  </div>
                  {!editProProfile && (
                    <Button variant="outline" size="sm" onClick={() => setEditProProfile(true)}>
                      Modifier
                    </Button>
                  )}
                </div>

                {editProProfile ? (
                  <form onSubmit={handleSaveProProfile} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description de votre activité
                      </label>
                      <textarea
                        value={proProfileData.companyDescription}
                        onChange={(e) => setProProfileData({ ...proProfileData, companyDescription: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent resize-none"
                        placeholder="Décrivez votre activité, vos produits, vos services..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum 500 caractères</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo de votre entreprise
                      </label>

                      {/* Current logo preview */}
                      {proProfileData.companyLogo && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg flex items-center gap-4">
                          <img
                            src={proProfileData.companyLogo}
                            alt="Logo actuel"
                            className="h-20 w-auto object-contain rounded border border-gray-200 bg-white p-2"
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600 mb-2">Logo actuel</p>
                            <button
                              type="button"
                              onClick={handleDeleteLogo}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Supprimer le logo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload zone */}
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          uploadingLogo ? 'border-gray-300 bg-gray-50' : 'border-forest/30 hover:border-forest hover:bg-forest/5'
                        }`}>
                          {uploadingLogo ? (
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-forest/30 border-t-forest rounded-full animate-spin" />
                              <span className="text-gray-600">Upload en cours...</span>
                            </div>
                          ) : (
                            <>
                              <svg className="w-10 h-10 mx-auto text-forest/50 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <p className="text-sm text-gray-600">
                                <span className="text-forest font-medium">Cliquez pour choisir</span> ou glissez-déposez votre logo
                              </p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WebP ou GIF - Max 2 Mo</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Site web de l&apos;entreprise
                      </label>
                      <input
                        type="url"
                        value={proProfileData.companyWebsite}
                        onChange={(e) => setProProfileData({ ...proProfileData, companyWebsite: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                        placeholder="https://www.mon-entreprise.fr"
                      />
                      <p className="text-xs text-gray-500 mt-1">Ce lien apparaîtra sur la page Exposants du site</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={savingProProfile}>
                        {savingProProfile ? 'Enregistrement...' : 'Enregistrer'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setEditProProfile(false)
                        setProProfileData({
                          companyDescription: profile?.companyDescription || '',
                          companyLogo: profile?.companyLogo || '',
                          companyWebsite: profile?.companyWebsite || '',
                        })
                      }}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {profile?.companyLogo && (
                      <div className="flex items-center gap-4">
                        <img
                          src={profile.companyLogo}
                          alt="Logo entreprise"
                          className="h-16 w-auto object-contain rounded-lg border border-gray-200 p-2"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-800">
                        {profile?.companyDescription || (
                          <span className="italic text-gray-400">Aucune description ajoutée</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Site web</p>
                      {profile?.companyWebsite ? (
                        <a
                          href={profile.companyWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-forest hover:underline flex items-center gap-1"
                        >
                          {profile.companyWebsite}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="italic text-gray-400">Aucun site web ajouté</span>
                      )}
                    </div>
                    {!profile?.companyDescription && !profile?.companyLogo && !profile?.companyWebsite && (
                      <div className="p-4 bg-forest/5 rounded-lg border border-forest/10">
                        <p className="text-sm text-forest">
                          Ajoutez une description, un logo et un site web pour apparaître sur la page Exposants du site.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Profile Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-semibold">Informations personnelles</h2>
                {!editMode && (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                    Modifier
                  </Button>
                )}
              </div>

              {editMode ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">L&apos;email ne peut pas être modifié</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Entreprise
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                    />
                  </div>

                  {isPro && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d&apos;activité
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                      >
                        <option value="">Sélectionnez votre activité</option>
                        {Object.entries(businessTypeLabels).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-forest rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {(profile?.name || profile?.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{profile?.name || 'Non renseigné'}</p>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="font-medium">{profile?.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Entreprise</p>
                      <p className="font-medium">{profile?.companyName || 'Non renseigné'}</p>
                    </div>
                    {isPro && (
                      <>
                        <div>
                          <p className="text-sm text-gray-500">SIRET</p>
                          <p className="font-medium font-mono">{profile?.siret || 'Non renseigné'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type d&apos;activité</p>
                          <p className="font-medium">
                            {profile?.businessType ? businessTypeLabels[profile.businessType] : 'Non renseigné'}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* PRO Request Card - Only for non-PRO users */}
          {canRequestPro && (
            <Card className="border-forest/20">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-forest">Devenir exposant professionnel</h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Accédez à l&apos;Espace Pro pour réserver votre stand, gérer vos informations exposant et profiter d&apos;avantages exclusifs.
                    </p>

                    {!showProRequest ? (
                      <Button
                        variant="primary"
                        className="mt-4"
                        onClick={() => setShowProRequest(true)}
                      >
                        Faire une demande
                      </Button>
                    ) : (
                      <form onSubmit={handleProRequest} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nom de l&apos;entreprise *
                          </label>
                          <input
                            type="text"
                            value={proFormData.companyName}
                            onChange={(e) => setProFormData({ ...proFormData, companyName: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            SIRET *
                          </label>
                          <input
                            type="text"
                            value={proFormData.siret}
                            onChange={(e) => setProFormData({ ...proFormData, siret: e.target.value })}
                            required
                            maxLength={17}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                            placeholder="123 456 789 00012"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type d&apos;activité *
                          </label>
                          <select
                            value={proFormData.businessType}
                            onChange={(e) => setProFormData({ ...proFormData, businessType: e.target.value })}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          >
                            <option value="">Sélectionnez votre activité</option>
                            {Object.entries(businessTypeLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex gap-3">
                          <Button type="submit" disabled={saving}>
                            {saving ? 'Envoi...' : 'Envoyer la demande'}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowProRequest(false)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Member since */}
          <p className="text-center text-sm text-gray-500">
            Membre depuis le{' '}
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '...'}
          </p>
        </div>
      </div>
    </div>
  )
}
