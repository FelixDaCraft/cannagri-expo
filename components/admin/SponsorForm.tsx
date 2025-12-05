'use client'

import { useState } from 'react'
import { Button, Input, Badge } from '@/components/ui'
import type { Sponsor, SponsorType } from '@/types'

interface SponsorFormProps {
  sponsor?: Sponsor | null
  onSubmit: (data: Partial<Sponsor>) => Promise<void>
  onCancel: () => void
}

export function SponsorForm({ sponsor, onSubmit, onCancel }: SponsorFormProps) {
  const [formData, setFormData] = useState({
    name: sponsor?.name || '',
    slug: sponsor?.slug || '',
    type: sponsor?.type || 'STANDARD' as SponsorType,
    logoUrl: sponsor?.logoUrl || '',
    description: sponsor?.description || '',
    websiteUrl: sponsor?.websiteUrl || '',
    standNumber: sponsor?.standNumber || '',
    articleTitle: sponsor?.articleTitle || '',
    articleBody: sponsor?.articleBody || '',
    articleImage: sponsor?.articleImage || '',
    displayOrder: sponsor?.displayOrder || 0,
    isActive: sponsor?.isActive ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await onSubmit(formData)
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
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="STANDARD"
                checked={formData.type === 'STANDARD'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="text-forest focus:ring-sage"
              />
              <span>Standard</span>
              <Badge variant="sage" size="sm">Logo + page</Badge>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="type"
                value="PREMIUM"
                checked={formData.type === 'PREMIUM'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as SponsorType })}
                className="text-forest focus:ring-sage"
              />
              <span>Premium</span>
              <Badge variant="forest" size="sm">Article + visibilité</Badge>
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
            label="Numéro de stand"
            name="standNumber"
            value={formData.standNumber}
            onChange={(e) => setFormData({ ...formData, standNumber: e.target.value })}
            placeholder="A1, B2..."
          />
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

      {/* Premium Article (only show if type is PREMIUM) */}
      {formData.type === 'PREMIUM' && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
            Article Premium
            <Badge variant="forest" className="ml-2">Visible en page d&apos;accueil</Badge>
          </h3>

          <Input
            label="Titre de l'article"
            name="articleTitle"
            value={formData.articleTitle}
            onChange={(e) => setFormData({ ...formData, articleTitle: e.target.value })}
            placeholder="Innovation dans le secteur CBD..."
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contenu de l&apos;article
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
