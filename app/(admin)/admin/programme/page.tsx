'use client'

import { useState, useEffect, useCallback } from 'react'
import { DataTable } from '@/components/admin'
import { Button, Badge, Modal, Input } from '@/components/ui'

// Counter for unique IDs
let speakerIdCounter = 0
function generateSpeakerId(): string {
  speakerIdCounter += 1
  return `speaker-${Date.now()}-${speakerIdCounter}`
}

interface Speaker {
  id: string
  name: string
  title: string
  company: string
  photo: string
  bio: string
}

interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  type: string
  startAt: string
  endAt: string
  location: string | null
  speakers: Speaker[]
  isPlatinumCBDCup: boolean
  isHighlighted: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// Labels et badges pour les types d'événements
const eventTypeLabels = {
  CONFERENCE: { label: 'Conférence', variant: 'forest' as const, icon: '🎤' },
  WORKSHOP: { label: 'Atelier', variant: 'sage' as const, icon: '🛠️' },
  CEREMONY: { label: 'Cérémonie', variant: 'terracotta' as const, icon: '🏆' },
  BREAK: { label: 'Pause', variant: 'default' as const, icon: '☕' },
  NETWORKING: { label: 'Networking', variant: 'sage' as const, icon: '🤝' },
}

const eventTypes = [
  { value: 'CONFERENCE', label: 'Conférence', icon: '🎤' },
  { value: 'WORKSHOP', label: 'Atelier', icon: '🛠️' },
  { value: 'CEREMONY', label: 'Cérémonie', icon: '🏆' },
  { value: 'BREAK', label: 'Pause', icon: '☕' },
  { value: 'NETWORKING', label: 'Networking', icon: '🤝' },
]

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const columns = [
  {
    key: 'time',
    label: 'Horaire',
    render: (event: Event) => (
      <div className="text-sm">
        <div className="font-medium text-forest">{formatTime(event.startAt)}</div>
        <div className="text-gray-500">{formatTime(event.endAt)}</div>
      </div>
    ),
  },
  {
    key: 'title',
    label: 'Titre',
    sortable: true,
    render: (event: Event) => (
      <div>
        <div className="font-medium flex items-center gap-2">
          {event.title}
          {event.isPlatinumCBDCup && <span className="text-yellow-500">🏆</span>}
        </div>
        {event.location && (
          <div className="text-xs text-gray-500">{event.location}</div>
        )}
      </div>
    ),
  },
  {
    key: 'type',
    label: 'Type',
    render: (event: Event) => {
      const typeInfo = eventTypeLabels[event.type as keyof typeof eventTypeLabels] || { label: event.type, variant: 'default' as const, icon: '📅' }
      return (
        <Badge variant={typeInfo.variant}>
          {typeInfo.icon} {typeInfo.label}
        </Badge>
      )
    },
  },
  {
    key: 'speakers',
    label: 'Intervenants',
    render: (event: Event) => {
      const speakers = event.speakers || []
      if (speakers.length === 0) return '-'
      if (speakers.length === 1) return speakers[0].name
      return `${speakers.length} intervenants`
    },
  },
  {
    key: 'isHighlighted',
    label: 'Statut',
    render: (event: Event) => (
      <div className="flex gap-1">
        {event.isHighlighted && (
          <Badge variant="terracotta">Mis en avant</Badge>
        )}
        {event.isPlatinumCBDCup && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            CBD Cup
          </Badge>
        )}
      </div>
    ),
  },
]

// Composant pour un intervenant
function SpeakerCard({
  speaker,
  index,
  onUpdate,
  onRemove,
}: {
  speaker: Speaker
  index: number
  onUpdate: (index: number, speaker: Speaker) => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="border border-sage/30 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-medium text-gray-900">Intervenant {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-1"
          title="Supprimer cet intervenant"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nom *"
          value={speaker.name}
          onChange={(e) => onUpdate(index, { ...speaker, name: e.target.value })}
          placeholder="Nom de l'intervenant"
        />
        <Input
          label="Titre/Fonction"
          value={speaker.title}
          onChange={(e) => onUpdate(index, { ...speaker, title: e.target.value })}
          placeholder="Ex: CEO, Expert, Chercheur..."
        />
        <Input
          label="Entreprise"
          value={speaker.company}
          onChange={(e) => onUpdate(index, { ...speaker, company: e.target.value })}
          placeholder="Nom de l'entreprise"
        />
        <Input
          label="Photo (URL)"
          value={speaker.photo}
          onChange={(e) => onUpdate(index, { ...speaker, photo: e.target.value })}
          placeholder="https://..."
        />
      </div>

      {speaker.photo && (
        <div className="mt-3">
          <img
            src={speaker.photo}
            alt={speaker.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-sage/30"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Biographie
        </label>
        <textarea
          value={speaker.bio}
          onChange={(e) => onUpdate(index, { ...speaker, bio: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-sage/30 focus:border-forest focus:ring-2 focus:ring-forest/20 text-sm"
          placeholder="Courte biographie de l'intervenant..."
        />
      </div>
    </div>
  )
}

// Formulaire d'événement
function EventForm({
  event,
  onSubmit,
  onCancel,
}: {
  event: Event | null
  onSubmit: (data: Partial<Event>) => void
  onCancel: () => void
}) {
  // Parse speakers safely - ensure it's always an array
  const parseSpeakers = (speakers: unknown): Speaker[] => {
    if (!speakers) return []
    if (Array.isArray(speakers)) return speakers as Speaker[]
    if (typeof speakers === 'string') {
      try {
        const parsed = JSON.parse(speakers)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const [formData, setFormData] = useState({
    title: event?.title || '',
    slug: event?.slug || '',
    description: event?.description || '',
    type: event?.type || 'CONFERENCE',
    startAt: event?.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : '',
    endAt: event?.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    speakers: parseSpeakers(event?.speakers),
    isPlatinumCBDCup: event?.isPlatinumCBDCup || false,
    isHighlighted: event?.isHighlighted || false,
    displayOrder: event?.displayOrder || 0,
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setFormData({
      ...formData,
      title,
      slug: event ? formData.slug : generateSlug(title),
    })
  }

  const addSpeaker = useCallback(() => {
    const newSpeaker: Speaker = {
      id: generateSpeakerId(),
      name: '',
      title: '',
      company: '',
      photo: '',
      bio: '',
    }
    setFormData(prev => {
      const updated = {
        ...prev,
        speakers: [...prev.speakers, newSpeaker],
      }
      console.log('Added speaker, new count:', updated.speakers.length)
      return updated
    })
  }, [])

  const updateSpeaker = useCallback((index: number, speaker: Speaker) => {
    setFormData(prev => {
      const newSpeakers = [...prev.speakers]
      newSpeakers[index] = speaker
      return { ...prev, speakers: newSpeakers }
    })
  }, [])

  const removeSpeaker = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      speakers: prev.speakers.filter((_, i) => i !== index),
    }))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter out speakers without name
    const validSpeakers = formData.speakers.filter(s => s.name.trim() !== '')
    onSubmit({ ...formData, speakers: validSpeakers })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Titre de l'événement"
            value={formData.title}
            onChange={handleTitleChange}
            required
          />
        </div>
        <Input
          label="Slug (URL)"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type d&apos;événement
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-sage/30 focus:border-forest focus:ring-2 focus:ring-forest/20"
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Horaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Début
          </label>
          <input
            type="datetime-local"
            value={formData.startAt}
            onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-sage/30 focus:border-forest focus:ring-2 focus:ring-forest/20"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fin
          </label>
          <input
            type="datetime-local"
            value={formData.endAt}
            onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-sage/30 focus:border-forest focus:ring-2 focus:ring-forest/20"
            required
          />
        </div>
      </div>

      {/* Lieu et description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Lieu"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Ex: Scène principale, Salle B..."
        />
        <Input
          label="Ordre d'affichage"
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-sage/30 focus:border-forest focus:ring-2 focus:ring-forest/20"
          placeholder="Description de l'événement..."
        />
      </div>

      {/* Intervenants */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">
            Intervenants ({formData.speakers.length})
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addSpeaker}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Ajouter un intervenant
          </Button>
        </div>

        {formData.speakers.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-lg">
            Aucun intervenant ajouté. Cliquez sur &quot;Ajouter un intervenant&quot; pour en ajouter.
          </p>
        ) : (
          <div className="space-y-4">
            {formData.speakers.map((speaker, index) => (
              <SpeakerCard
                key={speaker.id}
                speaker={speaker}
                index={index}
                onUpdate={updateSpeaker}
                onRemove={removeSpeaker}
              />
            ))}
          </div>
        )}
      </div>

      {/* Options */}
      <div className="border-t pt-4">
        <h3 className="font-medium text-gray-900 mb-4">Options</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isHighlighted}
              onChange={(e) => setFormData({ ...formData, isHighlighted: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
            />
            <span className="text-sm">Mettre en avant</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isPlatinumCBDCup}
              onChange={(e) => setFormData({ ...formData, isPlatinumCBDCup: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300 text-forest focus:ring-forest"
            />
            <span className="text-sm">🏆 Platinum CBD Cup</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {event ? 'Mettre à jour' : 'Créer l\'événement'}
        </Button>
      </div>
    </form>
  )
}

export default function ProgrammePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/events')
      const result = await response.json()

      if (result.success) {
        setEvents(result.data)
      } else {
        setError(result.error || 'Erreur lors du chargement des événements')
      }
    } catch (err) {
      setError('Erreur de connexion au serveur')
      console.error('Error fetching events:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (data: Partial<Event>) => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        setEvents([...events, result.data])
        setShowForm(false)
      } else {
        alert(result.error || 'Erreur lors de la création de l\'événement')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error creating event:', err)
    }
  }

  const handleUpdate = async (data: Partial<Event>) => {
    if (!editingEvent) return

    try {
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()

      if (result.success) {
        setEvents(events.map((e) => (e.id === editingEvent.id ? result.data : e)))
        setEditingEvent(null)
        setShowForm(false)
      } else {
        alert(result.error || 'Erreur lors de la mise à jour de l\'événement')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error updating event:', err)
    }
  }

  const handleDelete = async (event: Event) => {
    if (!confirm(`Supprimer l'événement "${event.title}" ?`)) return

    try {
      const response = await fetch(`/api/admin/events/${event.id}`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (result.success) {
        setEvents(events.filter((e) => e.id !== event.id))
      } else {
        alert(result.error || 'Erreur lors de la suppression de l\'événement')
      }
    } catch (err) {
      alert('Erreur de connexion au serveur')
      console.error('Error deleting event:', err)
    }
  }

  const handleExport = () => {
    const csv = [
      ['Titre', 'Type', 'Début', 'Fin', 'Lieu', 'Intervenants'].join(','),
      ...events.map((e) =>
        [
          e.title,
          e.type,
          formatDate(e.startAt) + ' ' + formatTime(e.startAt),
          formatTime(e.endAt),
          e.location || '',
          (e.speakers || []).map(s => s.name).join(' / '),
        ].join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'programme.csv'
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du programme...</p>
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
          <Button onClick={fetchEvents}>Réessayer</Button>
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
            Programme
          </h1>
          <p className="text-gray-600">Gérez le programme de l&apos;événement</p>
        </div>
        <Button onClick={() => { setEditingEvent(null); setShowForm(true); }}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel événement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{events.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">🎤 Conférences</p>
          <p className="text-2xl font-bold text-forest">
            {events.filter((e) => e.type === 'CONFERENCE').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">🛠️ Ateliers</p>
          <p className="text-2xl font-bold text-sage">
            {events.filter((e) => e.type === 'WORKSHOP').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">🏆 Cérémonies</p>
          <p className="text-2xl font-bold text-terracotta">
            {events.filter((e) => e.type === 'CEREMONY').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">🤝 Networking</p>
          <p className="text-2xl font-bold text-blue-600">
            {events.filter((e) => e.type === 'NETWORKING').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable
        data={events}
        columns={columns}
        onEdit={(event) => { setEditingEvent(event); setShowForm(true); }}
        onDelete={handleDelete}
        onExport={handleExport}
        searchPlaceholder="Rechercher un événement..."
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(null); }}
        title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
        size="3xl"
      >
        <EventForm
          key={editingEvent?.id || 'new-event'}
          event={editingEvent}
          onSubmit={editingEvent ? handleUpdate : handleCreate}
          onCancel={() => { setShowForm(false); setEditingEvent(null); }}
        />
      </Modal>
    </div>
  )
}
