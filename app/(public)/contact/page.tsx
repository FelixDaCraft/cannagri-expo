'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { useSearchParams } from 'next/navigation'
import { Button, Input } from '@/components/ui'
import { siteConfig } from '@/config/site'

const contactTypes = [
  { value: 'GENERAL', label: 'Question générale' },
  { value: 'PRESS', label: 'Presse / Média' },
  { value: 'SPONSOR', label: 'Partenariat / Sponsoring' },
  { value: 'EXHIBITOR', label: 'Devenir exposant' },
]

export default function ContactPage() {
  const searchParams = useSearchParams()
  const typeParam = searchParams.get('type')

  const [formData, setFormData] = useState({
    type: typeParam === 'press' ? 'PRESS' : typeParam === 'sponsor' ? 'SPONSOR' : typeParam === 'exhibitor' ? 'EXHIBITOR' : 'GENERAL',
    name: '',
    email: '',
    phone: '',
    company: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Une erreur est survenue')
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-cream pt-24 pb-16">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center py-16"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-bold text-forest mb-4">
              Message envoyé !
            </h1>
            <p className="text-forest/70 mb-8">
              Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
            </p>
            <Button onClick={() => { setSubmitted(false); setFormData({ ...formData, subject: '', message: '' }) }}>
              Envoyer un autre message
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-forest mb-4">
              Contactez-nous
            </h1>
            <p className="text-lg text-forest/70 max-w-2xl mx-auto">
              Une question sur le salon, les stands ou les partenariats ? Notre équipe est à votre disposition.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading font-bold text-forest mb-4">Informations</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-terracotta mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-forest">{siteConfig.event.location}</p>
                      <p className="text-sm text-forest/70">{siteConfig.event.address}</p>
                      <p className="text-sm text-forest/70">{siteConfig.event.city}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-terracotta mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-forest">Email</p>
                      <a href={`mailto:${siteConfig.contact.email}`} className="text-sm text-terracotta hover:underline">
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-terracotta mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium text-forest">Téléphone</p>
                      <a href={`tel:${siteConfig.contact.phone}`} className="text-sm text-terracotta hover:underline">
                        {siteConfig.contact.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-forest text-cream rounded-2xl p-6">
                <h3 className="font-heading font-bold mb-3">Presse & Médias</h3>
                <p className="text-sm text-cream/80 mb-4">
                  Journalistes et médias, contactez notre service presse pour les accréditations et interviews.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-cream text-cream hover:bg-cream hover:text-forest"
                  onClick={() => setFormData({ ...formData, type: 'PRESS' })}
                >
                  Contact Presse
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-sm space-y-6">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-forest mb-2">Type de demande</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-forest/20 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent bg-white"
                  >
                    {contactTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">Nom *</label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">Email *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="votre@email.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">Téléphone</label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="06 12 34 56 78"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-forest mb-2">Société</label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Nom de votre société"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest mb-2">Sujet *</label>
                  <Input
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Objet de votre message"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-forest mb-2">Message *</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Votre message..."
                    className="w-full px-4 py-2 border border-forest/20 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent resize-none"
                  />
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>

                <p className="text-xs text-forest/50 text-center">
                  En soumettant ce formulaire, vous acceptez notre{' '}
                  <a href="/confidentialite" className="text-terracotta hover:underline">
                    politique de confidentialité
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
