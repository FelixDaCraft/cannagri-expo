'use client'

import { useState } from 'react'
import { Button, Badge } from '@/components/ui'

interface Translations {
  en?: string
  de?: string
  es?: string
  it?: string
}

interface TranslationEditorProps {
  sponsorId: string
  sponsorName: string
  articleTitle: string | null
  articleBody: string | null
  articleTitleTranslations: Translations | null
  articleBodyTranslations: Translations | null
  onClose: () => void
  onSave: () => void
}

const localeLabels = {
  en: { name: 'Anglais', flag: '🇬🇧' },
  de: { name: 'Allemand', flag: '🇩🇪' },
  es: { name: 'Espagnol', flag: '🇪🇸' },
  it: { name: 'Italien', flag: '🇮🇹' },
}

type LocaleKey = keyof typeof localeLabels

export function TranslationEditor({
  sponsorId,
  sponsorName,
  articleTitle,
  articleBody,
  articleTitleTranslations,
  articleBodyTranslations,
  onClose,
  onSave,
}: TranslationEditorProps) {
  const [activeLocale, setActiveLocale] = useState<LocaleKey>('en')
  const [isTranslating, setIsTranslating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // État local pour les traductions
  const [titleTranslations, setTitleTranslations] = useState<Translations>(
    articleTitleTranslations || {}
  )
  const [bodyTranslations, setBodyTranslations] = useState<Translations>(
    articleBodyTranslations || {}
  )

  // Générer les traductions automatiques
  const handleAutoTranslate = async () => {
    setIsTranslating(true)
    setMessage(null)

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsorId}/translate`, {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        setTitleTranslations(result.translations.articleTitleTranslations || {})
        setBodyTranslations(result.translations.articleBodyTranslations || {})
        setMessage({ type: 'success', text: 'Traductions générées avec succès!' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la traduction' })
      }
    } catch (error) {
      console.error('Translation error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la traduction' })
    } finally {
      setIsTranslating(false)
    }
  }

  // Sauvegarder une traduction modifiée
  const handleSaveTranslation = async (field: string, locale: LocaleKey, value: string) => {
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/sponsors/${sponsorId}/translate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, locale, value }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage({ type: 'success', text: 'Traduction sauvegardée!' })
        setTimeout(() => setMessage(null), 2000)
      } else {
        setMessage({ type: 'error', text: result.error || 'Erreur lors de la sauvegarde' })
      }
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
    } finally {
      setIsSaving(false)
    }
  }

  const hasTranslations = Object.keys(titleTranslations).length > 0 || Object.keys(bodyTranslations).length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Traductions de l&apos;article
          </h2>
          <p className="text-sm text-gray-600">{sponsorName}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAutoTranslate}
          disabled={isTranslating || !articleTitle}
        >
          {isTranslating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Traduction en cours...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              {hasTranslations ? 'Regénérer les traductions' : 'Générer les traductions'}
            </span>
          )}
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-3 rounded-lg text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Contenu français (référence) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <span className="text-lg">🇫🇷</span> Version française (originale)
        </h4>
        {articleTitle ? (
          <>
            <p className="font-medium text-gray-800">{articleTitle}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">{articleBody}</p>
          </>
        ) : (
          <p className="text-gray-500 italic">Aucun article rédigé</p>
        )}
      </div>

      {/* Onglets des langues */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4">
          {(Object.keys(localeLabels) as LocaleKey[]).map((locale) => {
            const hasTranslation = titleTranslations[locale] || bodyTranslations[locale]
            return (
              <button
                key={locale}
                onClick={() => setActiveLocale(locale)}
                className={`flex items-center gap-2 py-2 px-3 border-b-2 font-medium text-sm transition-colors ${
                  activeLocale === locale
                    ? 'border-forest text-forest'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{localeLabels[locale].flag}</span>
                <span>{localeLabels[locale].name}</span>
                {hasTranslation && (
                  <Badge variant="success" size="sm">Traduit</Badge>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Éditeur de traduction */}
      <div className="space-y-4">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre ({localeLabels[activeLocale].name})
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={titleTranslations[activeLocale] || ''}
              onChange={(e) =>
                setTitleTranslations({ ...titleTranslations, [activeLocale]: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest"
              placeholder={`Titre en ${localeLabels[activeLocale].name.toLowerCase()}...`}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleSaveTranslation(
                  'articleTitleTranslations',
                  activeLocale,
                  titleTranslations[activeLocale] || ''
                )
              }
              disabled={isSaving}
            >
              {isSaving ? '...' : 'Sauver'}
            </Button>
          </div>
        </div>

        {/* Corps */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contenu ({localeLabels[activeLocale].name})
          </label>
          <div className="space-y-2">
            <textarea
              value={bodyTranslations[activeLocale] || ''}
              onChange={(e) =>
                setBodyTranslations({ ...bodyTranslations, [activeLocale]: e.target.value })
              }
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-forest resize-none"
              placeholder={`Contenu en ${localeLabels[activeLocale].name.toLowerCase()}...`}
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleSaveTranslation(
                    'articleBodyTranslations',
                    activeLocale,
                    bodyTranslations[activeLocale] || ''
                  )
                }
                disabled={isSaving}
              >
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder le contenu'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
        <Button variant="primary" onClick={() => { onSave(); onClose(); }}>
          Terminer
        </Button>
      </div>
    </div>
  )
}
