'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Badge } from '@/components/ui'
import type { Sponsor, SponsorType, BusinessType, Stand } from '@/types'

interface SponsorFormProps {
  sponsor?: Sponsor | null
  onSubmit: (data: Partial<Sponsor>) => Promise<void>
  onCancel: () => void
}

const businessTypeLabels: Record<string, string> = {
  PRODUCTEURS: 'Producteurs & Cultivateurs',
  MATERIEL: 'Matériel & Équipement',
  LIFESTYLE: 'Lifestyle & Bien-être',
  SERVICE: 'Services & Conseil',
}

export function SponsorForm({ sponsor, onSubmit, onCancel }: SponsorFormProps) {
  const [stands, setStands] = useState<Stand[]>([])
  const [loadingStands, setLoadingStands] = useState(true)

  const [formData, setFormData] = useState({
    name: sponsor?.name || '',
    slug: sponsor?.slug || '',
    type: sponsor?.type || 'BRONZE' as SponsorType,
    logoUrl: sponsor?.logoUrl || '',
    description: sponsor?.description || '',
    websiteUrl: sponsor?.websiteUrl || '',
    articleTitle: sponsor?.articleTitle || '',
    articleBody: sponsor?.articleBody || '',
    articleImage: sponsor?.articleImage || '',
    displayOrder: sponsor?.displayOrder || 0,
    isActive: sponsor?.isActive ?? true,
    // Champs exposant
    standId: sponsor?.standId || '',
    exhibitorDescription: sponsor?.exhibitorDescription || '',
    exhibitorCategory: sponsor?.exhibitorCategory || '' as BusinessType | '',
    contactName: sponsor?.contactName || '',
    contactEmail: sponsor?.contactEmail || '',
    contactPhone: sponsor?.contactPhone || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Charger les stands disponibles
  useEffect(() => {
    async function fetchStands() {
      try {
        const response = await fetch('/api/stands')
        const result = await response.json()
        if (result.data) {
          // Filtrer les stands disponibles:
          // - Status FREE et pas de sponsor assigné
          // - Ou le stand actuel du sponsor (s'il existe)
          const availableStands = result.data.filter((stand: Stand & { sponsor?: { id: string } | null }) =>
            (stand.status === 'FREE' && !stand.sponsor) || stand.id === sponsor?.standId
          )
          setStands(availableStands)
        }
      } catch (err) {
        console.error('Error fetching stands:', err)
      } finally {
        setLoadingStands(false)
      }
    }
    fetchStands()
  }, [sponsor?.standId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Convertir les valeurs vides en null pour les champs optionnels
      const dataToSubmit = {
        ...formData,
        standId: formData.standId || null,
        exhibitorCategory: formData.exhibitorCategory || null,
      }
      await onSubmit(dataToSubmit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
    setFormData({ ...formData, slug })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Informations générales
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Nom du sponsor"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onBlur={generateSlug}
              required
            />
          </div>
          <div>
            <Input
              label="Slug (URL)"
              name="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              helperText="/sponsors/[slug]"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de sponsor
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="flex flex-col items-center gap-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-forest has-[:checked]:bg-forest/5">
              <input
                type="radio"
                name="type"
                value="PLATINE"
                checked={formData.type === 'PLATINE'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="sr-only"
              />
              <span className="font-semibold text-forest">Platine</span>
              <Badge variant="forest" size="sm">Article 1ère page</Badge>
              <span className="text-xs text-gray-500 text-center">4 stories, en-tête</span>
            </label>
            <label className="flex flex-col items-center gap-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
              <input
                type="radio"
                name="type"
                value="OR"
                checked={formData.type === 'OR'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="sr-only"
              />
              <span className="font-semibold text-amber-600">Or</span>
              <Badge variant="terracotta" size="sm">En-tête site</Badge>
              <span className="text-xs text-gray-500 text-center">3 stories</span>
            </label>
            <label className="flex flex-col items-center gap-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-gray-400 has-[:checked]:bg-gray-50">
              <input
                type="radio"
                name="type"
                value="ARGENT"
                checked={formData.type === 'ARGENT'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="sr-only"
              />
              <span className="font-semibold text-gray-500">Argent</span>
              <Badge variant="sage" size="sm">Milieu page</Badge>
              <span className="text-xs text-gray-500 text-center">2 stories</span>
            </label>
            <label className="flex flex-col items-center gap-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors has-[:checked]:border-amber-700 has-[:checked]:bg-amber-50">
              <input
                type="radio"
                name="type"
                value="BRONZE"
                checked={formData.type === 'BRONZE'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="sr-only"
              />
              <span className="font-semibold text-amber-800">Bronze</span>
              <Badge variant="default" size="sm">Bas de page</Badge>
              <span className="text-xs text-gray-500 text-center">1 story</span>
            </label>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Input
            label="URL du logo"
            name="logoUrl"
            value={formData.logoUrl}
            onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
            placeholder="https://..."
          />
          <Input
            label="Site web"
            name="websiteUrl"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <Input
            label="Ordre d'affichage"
            name="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage resize-none"
            placeholder="Description courte du sponsor..."
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-forest rounded focus:ring-sage"
            />
            <span className="text-sm">Actif (visible sur le site)</span>
          </label>
        </div>
      </div>

      {/* Informations Exposant */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
          Informations Exposant
          <Badge variant="sage" className="ml-2">Stand & Contact</Badge>
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Sélection du stand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stand attribué
            </label>
            <select
              value={formData.standId}
              onChange={(e) => setFormData({ ...formData, standId: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
              disabled={loadingStands}
            >
              <option value="">-- Aucun stand --</option>
              {stands.map((stand) => (
                <option key={stand.id} value={stand.id}>
                  Stand {stand.number} - {stand.surfaceM2}m² ({stand.priceHT}€ HT)
                  {stand.id === sponsor?.standId ? ' (actuel)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              {loadingStands ? 'Chargement des stands...' : `${stands.length} stand(s) disponible(s)`}
            </p>
          </div>

          {/* Catégorie métier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie métier
            </label>
            <select
              value={formData.exhibitorCategory}
              onChange={(e) => setFormData({ ...formData, exhibitorCategory: e.target.value as BusinessType | '' })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
            >
              <option value="">-- Sélectionner --</option>
              {Object.entries(businessTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Description exposant */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description de l&apos;activité
          </label>
          <textarea
            name="exhibitorDescription"
            value={formData.exhibitorDescription}
            onChange={(e) => setFormData({ ...formData, exhibitorDescription: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage resize-none"
            placeholder="Description de l'activité qui sera affichée sur la page exposants..."
          />
        </div>

        {/* Informations de contact */}
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <Input
            label="Nom du contact"
            name="contactName"
            value={formData.contactName}
            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
            placeholder="Jean Dupont"
          />
          <Input
            label="Email de contact"
            name="contactEmail"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            placeholder="contact@entreprise.fr"
          />
          <Input
            label="Téléphone"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>

      {/* Article Platine (only show if type is PLATINE) */}
      {formData.type === 'PLATINE' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Article Sponsorisé
            <Badge variant="forest" className="ml-2">Visible en page d&apos;accueil</Badge>
          </h3>

          <Input
            label="Titre de l'article (Français)"
            name="articleTitle"
            value={formData.articleTitle}
            onChange={(e) => setFormData({ ...formData, articleTitle: e.target.value })}
            placeholder="Innovation dans le secteur CBD..."
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu de l&apos;article (Français)
            </label>
            <textarea
              name="articleBody"
              value={formData.articleBody}
              onChange={(e) => setFormData({ ...formData, articleBody: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage resize-none"
              placeholder="Rédigez l'article qui sera affiché sur la page d'accueil..."
            />
          </div>

          <div className="mt-4">
            <Input
              label="Image de l'article"
              name="articleImage"
              value={formData.articleImage}
              onChange={(e) => setFormData({ ...formData, articleImage: e.target.value })}
              placeholder="https://..."
              helperText="Image mise en avant de l'article (format paysage recommandé)"
            />
          </div>

          {/* Note sur les traductions */}
          {sponsor && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Après avoir enregistré l&apos;article, vous pourrez générer et éditer les traductions automatiques depuis la liste des sponsors.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {sponsor ? 'Mettre à jour' : 'Créer le sponsor'}
        </Button>
      </div>
    </form>
  )
}
