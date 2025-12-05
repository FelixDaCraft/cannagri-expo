'use client'

import { useState } from 'react'
import { Card, CardContent, Badge, Button, Input, Modal } from '@/components/ui'

// Mock data
const mockMedia = [
  { id: '1', imageUrl: '/images/gallery/photo1.jpg', caption: 'Conférence d\'ouverture', edition: '2024', category: 'Conférences' },
  { id: '2', imageUrl: '/images/gallery/photo2.jpg', caption: 'Stand exposant', edition: '2024', category: 'Stands' },
  { id: '3', imageUrl: '/images/gallery/photo3.jpg', caption: 'Remise des prix CBD Cup', edition: '2024', category: 'Cérémonie' },
]

type Media = typeof mockMedia[0]

const categories = ['Conférences', 'Stands', 'Cérémonie', 'Networking', 'Produits']
const editions = ['2024', '2025', '2026']

export default function MediathequePage() {
  const [media, setMedia] = useState(mockMedia)
  const [showForm, setShowForm] = useState(false)
  const [filterEdition, setFilterEdition] = useState<string>('')
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: '',
    edition: '2024',
    category: 'Conférences',
  })

  const filteredMedia = filterEdition
    ? media.filter((m) => m.edition === filterEdition)
    : media

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newMedia: Media = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
    }
    setMedia([...media, newMedia])
    setShowForm(false)
    setFormData({ imageUrl: '', caption: '', edition: '2024', category: 'Conférences' })
  }

  const handleDelete = (item: Media) => {
    if (!confirm('Supprimer cette photo ?')) return
    setMedia(media.filter((m) => m.id !== item.id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600">Gérez les photos du salon</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter des photos
        </Button>
      </div>

      {/* Stats & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <Badge variant={!filterEdition ? 'forest' : 'default'}>
            <button onClick={() => setFilterEdition('')}>Toutes ({media.length})</button>
          </Badge>
          {editions.map((ed) => {
            const count = media.filter((m) => m.edition === ed).length
            return (
              <Badge key={ed} variant={filterEdition === ed ? 'forest' : 'default'}>
                <button onClick={() => setFilterEdition(ed)}>{ed} ({count})</button>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMedia.map((item) => (
          <Card key={item.id} variant="default" className="overflow-hidden p-0 group">
            <div className="relative aspect-square bg-sage/20">
              {/* Placeholder for actual images */}
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">{item.caption || 'Sans titre'}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="default" size="sm">{item.edition}</Badge>
                <Badge variant="sage" size="sm">{item.category}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Aucune photo pour cette édition</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Ajouter une photo">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="URL de l'image"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://..."
            required
            helperText="Hébergez vos images sur un service externe (Cloudinary, etc.)"
          />

          <Input
            label="Légende"
            name="caption"
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            placeholder="Description de la photo..."
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Édition</label>
              <select
                value={formData.edition}
                onChange={(e) => setFormData({ ...formData, edition: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
              >
                {editions.map((ed) => (
                  <option key={ed} value={ed}>{ed}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" className="flex-1">
              Ajouter
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
