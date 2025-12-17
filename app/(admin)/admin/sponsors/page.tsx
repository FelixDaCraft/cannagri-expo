'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { DataTable, SponsorForm, TranslationEditor } from '@/components/admin'
import { Button, Badge, Modal, Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Sponsor, Stand } from '@/types'

// Type étendu pour sponsor avec stand et traductions
interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

// Using type intersection instead of interface extension to avoid Prisma JsonValue conflicts
type SponsorWithStand = Sponsor & {
  stand: Stand | null
}

interface SponsorRequest {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string | null
  status: 'PENDING' | 'SENT'
  sentAt: string | null
  createdAt: string
}

// Labels et badges pour les types de sponsors
const sponsorTypeLabels = {
  PLATINE: { label: 'Platine', variant: 'forest' as const },
  OR: { label: 'Or', variant: 'terracotta' as const },
  ARGENT: { label: 'Argent', variant: 'sage' as const },
  BRONZE: { label: 'Bronze', variant: 'default' as const },
}

const statusConfig = {
  PENDING: { label: 'En attente', variant: 'warning' as const },
  SENT: { label: 'Traité', variant: 'success' as const },
}

const getColumns = (onTranslate: (sponsor: SponsorWithStand) => void) => [
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
    key: 'translations',
    label: 'Traductions',
    render: (sponsor: SponsorWithStand) => {
      if (sponsor.type !== 'PLATINE') return '-'
      const hasTranslations = sponsor.articleTitleTranslations || sponsor.articleBodyTranslations
      return (
        <button
          onClick={(e) => { e.stopPropagation(); onTranslate(sponsor); }}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
            hasTranslations
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
          )}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          {hasTranslations ? 'Éditer' : 'Traduire'}
        </button>
      )
    },
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

type TabType = 'sponsors' | 'requests'

export default function SponsorsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('sponsors')

  // Sponsors state
  const [sponsors, setSponsors] = useState<SponsorWithStand[]>([])
  const [editingSponsor, setEditingSponsor] = useState<SponsorWithStand | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loadingSponsors, setLoadingSponsors] = useState(true)
  const [errorSponsors, setErrorSponsors] = useState<string | null>(null)

  // Requests state
  const [requests, setRequests] = useState<SponsorRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [sending, setSending] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Email modal state
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<SponsorRequest | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  // Translation modal state
  const [showTranslationModal, setShowTranslationModal] = useState(false)
  const [translatingSponssor, setTranslatingSponsor] = useState<SponsorWithStand | null>(null)

  // Brochure upload state
  const [brochureInfo, setBrochureInfo] = useState<{
    exists: boolean
    url: string | null
    size: number
    lastModified: string | null
  } | null>(null)
  const [uploadingBrochure, setUploadingBrochure] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Ouvrir la modal si ?new=true dans l'URL
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true)
      router.replace('/admin/sponsors', { scroll: false })
    }
    // Aller sur l'onglet demandes si ?tab=requests
    if (searchParams.get('tab') === 'requests') {
      setActiveTab('requests')
      router.replace('/admin/sponsors', { scroll: false })
    }
  }, [searchParams, router])

  // Fetch sponsors
  useEffect(() => {
    fetchSponsors()
  }, [])

  // Fetch requests
  useEffect(() => {
    fetchRequests()
  }, [])

  // Fetch brochure info
  useEffect(() => {
    fetchBrochureInfo()
  }, [])

  const fetchSponsors = async () => {
    try {
      setLoadingSponsors(true)
      const response = await fetch('/api/admin/sponsors')
      const result = await response.json()

      if (result.success) {
        setSponsors(result.data)
      } else {
        setErrorSponsors(result.error || 'Erreur lors du chargement des sponsors')
      }
    } catch (err) {
      setErrorSponsors('Erreur de connexion au serveur')
      console.error('Error fetching sponsors:', err)
    } finally {
      setLoadingSponsors(false)
    }
  }

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true)
      const res = await fetch('/api/admin/sponsor-requests')
      const data = await res.json()
      if (data.data) {
        setRequests(data.data)
      }
    } catch (error) {
      console.error('Error fetching sponsor requests:', error)
    } finally {
      setLoadingRequests(false)
    }
  }

  const fetchBrochureInfo = async () => {
    try {
      const res = await fetch('/api/admin/sponsor-brochure')
      const data = await res.json()
      if (data.success) {
        setBrochureInfo(data.data)
      }
    } catch (error) {
      console.error('Error fetching brochure info:', error)
    }
  }

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Le fichier doit être un PDF' })
      return
    }

    setUploadingBrochure(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/sponsor-brochure', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Plaquette uploadée avec succès' })
        setBrochureInfo({
          exists: true,
          url: data.data.url,
          size: data.data.size,
          lastModified: data.data.lastModified,
        })
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'upload' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'upload' })
    } finally {
      setUploadingBrochure(false)
      // Reset input
      e.target.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'Ko', 'Mo', 'Go']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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

  // Ouvrir la modal d'édition du mail
  const openEmailModal = (request: SponsorRequest) => {
    setSelectedRequest(request)
    // Générer le template par défaut
    const defaultTemplate = getDefaultEmailTemplate(request.contactName, request.companyName)
    setEmailSubject(defaultTemplate.subject)
    setEmailBody(defaultTemplate.body)
    setShowEmailModal(true)
  }

  // Générer le template par défaut du mail
  const getDefaultEmailTemplate = (contactName: string, companyName: string) => {
    return {
      subject: `Cann'Agri Expo - Plaquette de sponsoring`,
      body: `Bonjour ${contactName},

Suite à votre demande d'information concernant les opportunités de sponsoring pour Cann'Agri Expo, nous avons le plaisir de vous transmettre notre plaquette de présentation.

Cann'Agri Expo est l'événement de référence du secteur, réunissant professionnels, passionnés et acteurs de l'industrie. En devenant partenaire, ${companyName} bénéficiera d'une visibilité exceptionnelle auprès d'un public ciblé et engagé.

Notre plaquette détaille les différentes formules de partenariat disponibles :
- Partenaire Platine : Visibilité maximale et article en page d'accueil
- Partenaire Or : Forte visibilité en en-tête du site
- Partenaire Argent : Visibilité ciblée
- Partenaire Bronze : Présence en bas de page

Nous restons à votre entière disposition pour échanger sur vos objectifs et vous proposer une formule adaptée à vos besoins.

Cordialement,
L'équipe Cann'Agri Expo`
    }
  }

  // Envoyer l'email avec le contenu personnalisé
  const handleSendEmail = async () => {
    if (!selectedRequest) return

    setSending(selectedRequest.id)
    try {
      const res = await fetch(`/api/admin/sponsor-requests/${selectedRequest.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          emailBody: emailBody,
        }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: 'Plaquette envoyée avec succès' })
        setShowEmailModal(false)
        setSelectedRequest(null)
        fetchRequests()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || 'Erreur lors de l\'envoi' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi' })
    } finally {
      setSending(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const requestStats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    sent: requests.filter((r) => r.status === 'SENT').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">
            Sponsors
          </h1>
          <p className="text-gray-600">Gérez les partenaires et les demandes de sponsoring</p>
        </div>
        {activeTab === 'sponsors' && (
          <Button onClick={() => { setEditingSponsor(null); setShowForm(true); }}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouveau sponsor
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('sponsors')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'sponsors'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              Sponsors
              <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                {sponsors.length}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={cn(
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === 'requests'
                ? 'border-forest text-forest'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Demandes
              {requestStats.pending > 0 && (
                <span className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-5 w-5 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                  <span className="relative inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                    {requestStats.pending}
                  </span>
                </span>
              )}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content: Sponsors */}
      {activeTab === 'sponsors' && (
        <>
          {loadingSponsors ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement des sponsors...</p>
              </div>
            </div>
          ) : errorSponsors ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-red-600 mb-4">{errorSponsors}</p>
                <Button onClick={fetchSponsors}>Réessayer</Button>
              </div>
            </div>
          ) : (
            <>
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
                columns={getColumns((sponsor) => { setTranslatingSponsor(sponsor); setShowTranslationModal(true); })}
                onEdit={(sponsor) => { setEditingSponsor(sponsor); setShowForm(true); }}
                onDelete={handleDelete}
                onExport={handleExport}
                searchPlaceholder="Rechercher un sponsor..."
              />
            </>
          )}
        </>
      )}

      {/* Tab Content: Requests */}
      {activeTab === 'requests' && (
        <>
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
          <div className="grid grid-cols-3 gap-4">
            <Card variant="default" className="bg-white">
              <CardContent className="text-center p-4">
                <p className="text-sm text-gray-600">Total demandes</p>
                <p className="text-2xl font-bold text-gray-900">{requestStats.total}</p>
              </CardContent>
            </Card>
            <Card variant="default" className="bg-white">
              <CardContent className="text-center p-4">
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{requestStats.pending}</p>
              </CardContent>
            </Card>
            <Card variant="default" className="bg-white">
              <CardContent className="text-center p-4">
                <p className="text-sm text-gray-600">Traités</p>
                <p className="text-2xl font-bold text-green-600">{requestStats.sent}</p>
              </CardContent>
            </Card>
          </div>

          {/* Brochure Upload */}
          <Card variant="default" className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Plaquette de sponsoring</h3>
                    {brochureInfo?.exists ? (
                      <div className="text-sm text-gray-600">
                        <span className="text-green-600 font-medium">Fichier présent</span>
                        {' - '}
                        {formatFileSize(brochureInfo.size)}
                        {brochureInfo.lastModified && (
                          <>
                            {' - Modifié le '}
                            {new Date(brochureInfo.lastModified).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-orange-600">Aucune plaquette uploadée</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {brochureInfo?.exists && brochureInfo.url && (
                    <a
                      href={brochureInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm text-forest hover:text-forest/80 border border-forest/30 rounded-lg hover:bg-forest/5 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Voir
                    </a>
                  )}
                  <label className={cn(
                    "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg cursor-pointer transition-colors",
                    uploadingBrochure
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-forest text-white hover:bg-forest/90"
                  )}>
                    {uploadingBrochure ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Upload...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        {brochureInfo?.exists ? 'Remplacer' : 'Uploader'}
                      </>
                    )}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleBrochureUpload}
                      disabled={uploadingBrochure}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {!brochureInfo?.exists && (
                <p className="mt-3 text-xs text-gray-500 bg-orange-50 p-2 rounded">
                  Attention : Vous devez uploader une plaquette de sponsoring (PDF) pour pouvoir l&apos;envoyer aux demandeurs.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Table */}
          {loadingRequests ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
            </div>
          ) : requests.length === 0 ? (
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">Aucune demande de sponsoring</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Entreprise
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr
                        key={request.id}
                        className={`hover:bg-gray-50 ${
                          request.status === 'SENT' ? 'opacity-60' : ''
                        }`}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.createdAt)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900">
                            {request.companyName}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div>
                            <span className="text-gray-900">{request.contactName}</span>
                            {request.phone && (
                              <span className="block text-xs text-gray-500">
                                {request.phone}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <a
                            href={`mailto:${request.email}`}
                            className="text-forest hover:underline"
                          >
                            {request.email}
                          </a>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <Badge variant={statusConfig[request.status].variant}>
                            {statusConfig[request.status].label}
                          </Badge>
                          {request.sentAt && (
                            <span className="block text-xs text-gray-400 mt-1">
                              Envoyé le {formatDate(request.sentAt)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          {request.status === 'PENDING' ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openEmailModal(request)}
                              disabled={sending === request.id}
                            >
                              {sending === request.id ? (
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                    />
                                  </svg>
                                  Envoi...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                  </svg>
                                  Envoyer plaquette
                                </span>
                              )}
                            </Button>
                          ) : (
                            <span className="text-green-600 flex items-center justify-end gap-1 text-sm">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Envoyé
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

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

      {/* Email Edit Modal */}
      <Modal
        isOpen={showEmailModal}
        onClose={() => { setShowEmailModal(false); setSelectedRequest(null); }}
        title="Envoyer la plaquette de sponsoring"
        size="3xl"
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Destinataire */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-forest/10 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedRequest.contactName}</p>
                  <p className="text-sm text-gray-600">{selectedRequest.companyName}</p>
                  <p className="text-sm text-forest">{selectedRequest.email}</p>
                </div>
              </div>
            </div>

            {/* Sujet */}
            <div>
              <label htmlFor="email-subject" className="block text-sm font-medium text-gray-700 mb-2">
                Sujet du mail
              </label>
              <input
                id="email-subject"
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
                placeholder="Sujet de l'email"
              />
            </div>

            {/* Corps du mail */}
            <div>
              <label htmlFor="email-body" className="block text-sm font-medium text-gray-700 mb-2">
                Contenu du mail
              </label>
              <textarea
                id="email-body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest font-mono text-sm"
                placeholder="Contenu de l'email..."
              />
              <p className="mt-2 text-xs text-gray-500">
                La plaquette de sponsoring sera automatiquement jointe en pièce jointe.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <button
                type="button"
                onClick={() => {
                  const template = getDefaultEmailTemplate(selectedRequest.contactName, selectedRequest.companyName)
                  setEmailSubject(template.subject)
                  setEmailBody(template.body)
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Réinitialiser le template
              </button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => { setShowEmailModal(false); setSelectedRequest(null); }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendEmail}
                  disabled={sending === selectedRequest.id || !emailSubject || !emailBody}
                >
                  {sending === selectedRequest.id ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Envoyer
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Translation Modal */}
      <Modal
        isOpen={showTranslationModal}
        onClose={() => { setShowTranslationModal(false); setTranslatingSponsor(null); }}
        title="Gestion des traductions"
        size="3xl"
      >
        {translatingSponssor && (
          <TranslationEditor
            sponsorId={translatingSponssor.id}
            sponsorName={translatingSponssor.name}
            articleTitle={translatingSponssor.articleTitle || null}
            articleBody={translatingSponssor.articleBody || null}
            articleTitleTranslations={(translatingSponssor.articleTitleTranslations as Translations) || null}
            articleBodyTranslations={(translatingSponssor.articleBodyTranslations as Translations) || null}
            onClose={() => { setShowTranslationModal(false); setTranslatingSponsor(null); }}
            onSave={fetchSponsors}
          />
        )}
      </Modal>
    </div>
  )
}
