'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [previewArticle, setPreviewArticle] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const articleBodyRef = useRef<HTMLTextAreaElement>(null)

  const insertHtml = useCallback((before: string, after = '') => {
    const textarea = articleBodyRef.current
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = textarea.value.substring(start, end)
    const inserted = before + selected + after
    const newValue = textarea.value.substring(0, start) + inserted + textarea.value.substring(end)
    setFormData(prev => ({ ...prev, articleBody: newValue }))
    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = selected ? start + inserted.length : start + before.length
      textarea.setSelectionRange(cursor, cursor)
    })
  }, [])

  const handleLogoUpload = useCallback(async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      setError('Type de fichier non autorisé. Utilisez JPG, PNG, WebP ou SVG.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux. Maximum 5 Mo.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const body = new FormData()
      body.append('logo', file)

      const res = await fetch('/api/admin/sponsors/upload-logo', {
        method: 'POST',
        body,
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Erreur lors de l'upload")
      }

      setFormData(prev => ({ ...prev, logoUrl: result.logoUrl }))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload du logo")
    } finally {
      setIsUploading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleLogoUpload(file)
  }, [handleLogoUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

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

        {/* Logo upload */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo du sponsor
          </label>
          <div className="flex gap-4 items-start">
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative flex-1 flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors
                ${isDragging
                  ? 'border-forest bg-forest/5'
                  : 'border-gray-300 hover:border-sage hover:bg-gray-50'
                }
                ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleLogoUpload(file)
                  e.target.value = ''
                }}
              />
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-sm text-gray-600">
                {isUploading ? 'Upload en cours...' : 'Glissez un logo ici ou cliquez pour choisir'}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG, WebP, SVG — max 5 Mo</span>
            </div>

            {/* Preview */}
            {formData.logoUrl && (
              <div className="relative flex-shrink-0 w-24 h-24 border rounded-xl overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={formData.logoUrl}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  title="Supprimer le logo"
                >
                  &times;
                </button>
              </div>
            )}
          </div>

          {/* Fallback URL input */}
          <details className="mt-2">
            <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600">
              Ou coller une URL directement
            </summary>
            <Input
              label=""
              name="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              placeholder="https://..."
              className="mt-1"
            />
          </details>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mt-4">
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
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Contenu de l&apos;article (Français)
              </label>
              <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewArticle(false)}
                  className={`px-3 py-1 transition-colors ${!previewArticle ? 'bg-forest text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  HTML
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewArticle(true)}
                  className={`px-3 py-1 transition-colors ${previewArticle ? 'bg-forest text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Prévisualisation
                </button>
              </div>
            </div>
            {!previewArticle ? (
              <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-sage focus-within:border-sage">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
                  {[
                    { label: 'p', title: 'Paragraphe', before: '<p>', after: '</p>' },
                    { label: 'br', title: 'Saut de ligne', before: '<br>', after: '' },
                    { label: 'B', title: 'Gras', before: '<strong>', after: '</strong>' },
                    { label: 'I', title: 'Italique', before: '<em>', after: '</em>' },
                    { label: 'H2', title: 'Titre 2', before: '<h2>', after: '</h2>' },
                    { label: 'H3', title: 'Titre 3', before: '<h3>', after: '</h3>' },
                    { label: '• li', title: 'Élément de liste', before: '<li>', after: '</li>' },
                    { label: 'ul', title: 'Liste à puces', before: '<ul>\n  <li>', after: '</li>\n</ul>' },
                    { label: 'a', title: 'Lien', before: '<a href="">', after: '</a>' },
                  ].map(({ label, title, before, after }) => (
                    <button
                      key={label}
                      type="button"
                      title={title}
                      onClick={() => insertHtml(before, after)}
                      className="px-2 py-0.5 text-xs font-mono bg-white border border-gray-200 rounded hover:bg-forest hover:text-white hover:border-forest transition-colors"
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={articleBodyRef}
                  name="articleBody"
                  value={formData.articleBody}
                  onChange={(e) => setFormData({ ...formData, articleBody: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-3 font-mono text-sm resize-y outline-none"
                  placeholder="<p>Rédigez l'article en HTML...</p>"
                  spellCheck={false}
                />
              </div>
            ) : (
              <div
                className="w-full min-h-[240px] px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: formData.articleBody || '<p style="color:#9ca3af">Aucun contenu à prévisualiser...</p>' }}
              />
            )}
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
