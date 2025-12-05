'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, Badge, Button, Input, Modal } from '@/components/ui'

interface Media {
  id: string
  imageUrl: string
  caption: string | null
  edition: string
  category: string | null
  displayOrder: number
}

const categories = ['Conférences', 'Stands', 'Cérémonie', 'Networking', 'Produits', 'Général']
const editions = ['2024', '2025', '2026']

export default function AdminMediathequePage() {
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterEdition, setFilterEdition] = useState<string>('')
  const [uploadProgress, setUploadProgress] = useState<string>('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadForm, setUploadForm] = useState({
    edition: '2024',
    category: 'Général',
    caption: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch media on mount
  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) {
        const data = await res.json()
        setMedia(data)
      }
    } catch (error) {
      console.error('Error fetching media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(prev => [...prev, ...files])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setUploadProgress(`Upload de 0/${selectedFiles.length}...`)

    let uploaded = 0
    const errors: string[] = []

    for (const file of selectedFiles) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('edition', uploadForm.edition)
        formData.append('category', uploadForm.category)
        formData.append('caption', uploadForm.caption || file.name.replace(/\.[^/.]+$/, ''))

        const res = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          const error = await res.json()
          errors.push(`${file.name}: ${error.error || 'Erreur'}`)
        } else {
          uploaded++
        }
        setUploadProgress(`Upload de ${uploaded}/${selectedFiles.length}...`)
      } catch {
        errors.push(`${file.name}: Erreur réseau`)
      }
    }

    setUploading(false)
    setUploadProgress('')

    if (errors.length > 0) {
      alert(`Upload terminé avec des erreurs:\n${errors.join('\n')}`)
    }

    // Refresh and reset
    await fetchMedia()
    setShowUploadModal(false)
    setSelectedFiles([])
    setUploadForm({ edition: '2024', category: 'Général', caption: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (item: Media) => {
    if (!confirm(`Supprimer cette photo ?\n${item.caption || item.imageUrl}`)) return

    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMedia(prev => prev.filter(m => m.id !== item.id))
      } else {
        alert('Erreur lors de la suppression')
      }
    } catch {
      alert('Erreur réseau')
    }
  }

  const filteredMedia = filterEdition
    ? media.filter(m => m.edition === filterEdition)
    : media

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Médiathèque</h1>
          <p className="text-gray-600">Gérez les photos du salon ({media.length} photos)</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Ajouter des photos
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={!filterEdition ? 'forest' : 'default'}
          className="cursor-pointer"
          onClick={() => setFilterEdition('')}
        >
          Toutes ({media.length})
        </Badge>
        {editions.map(ed => {
          const count = media.filter(m => m.edition === ed).length
          return (
            <Badge
              key={ed}
              variant={filterEdition === ed ? 'forest' : 'default'}
              className="cursor-pointer"
              onClick={() => setFilterEdition(ed)}
            >
              {ed} ({count})
            </Badge>
          )
        })}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredMedia.map(item => (
          <Card key={item.id} variant="default" className="overflow-hidden p-0 group">
            <div className="relative aspect-square bg-sage/20">
              <Image
                src={item.imageUrl}
                alt={item.caption || 'Photo'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />

              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  onClick={() => handleDelete(item)}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.caption || 'Sans titre'}
              </p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <Badge variant="default" size="sm">{item.edition}</Badge>
                {item.category && <Badge variant="sage" size="sm">{item.category}</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredMedia.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg">Aucune photo</p>
            <p className="text-sm">Cliquez sur &quot;Ajouter des photos&quot; pour commencer</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUploadModal} onClose={() => !uploading && setShowUploadModal(false)} title="Ajouter des photos">
        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner des photos
            </label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-forest transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">Cliquez pour sélectionner des photos</p>
              <p className="text-sm text-gray-400 mt-1">JPG, PNG ou WebP (max 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos sélectionnées ({selectedFiles.length})
              </label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm truncate flex-1">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeSelectedFile(index)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Édition</label>
              <select
                value={uploadForm.edition}
                onChange={(e) => setUploadForm(prev => ({ ...prev, edition: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                disabled={uploading}
              >
                {editions.map(ed => (
                  <option key={ed} value={ed}>{ed}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select
                value={uploadForm.category}
                onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage"
                disabled={uploading}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="Légende (optionnel)"
            value={uploadForm.caption}
            onChange={(e) => setUploadForm(prev => ({ ...prev, caption: e.target.value }))}
            placeholder="Description commune aux photos..."
            disabled={uploading}
            helperText="Si vide, le nom du fichier sera utilisé"
          />

          {/* Progress */}
          {uploading && uploadProgress && (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-center">
              <div className="animate-pulse">{uploadProgress}</div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              className="flex-1"
              disabled={uploading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleUpload}
              className="flex-1"
              disabled={uploading || selectedFiles.length === 0}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Upload en cours...
                </>
              ) : (
                `Uploader ${selectedFiles.length} photo${selectedFiles.length > 1 ? 's' : ''}`
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
