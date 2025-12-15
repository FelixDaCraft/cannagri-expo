'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { Card, CardContent, Badge, Button } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'

interface Exhibitor {
  id: string
  name: string
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  standNumber: string
  category: string
  categoryLabel: string
}

interface Category {
  slug: string
  name: string
  count: number
}

export default function ExposantsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([])
  const [categories, setCategories] = useState<Category[]>([
    { slug: 'all', name: 'Tous', count: 0 },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchExhibitors()
  }, [])

  const fetchExhibitors = async () => {
    try {
      const res = await fetch('/api/exposants')
      const data = await res.json()
      if (data.success) {
        setExhibitors(data.data)
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching exhibitors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredExhibitors = selectedCategory === 'all'
    ? exhibitors
    : exhibitors.filter(e => e.category === selectedCategory)

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-0 md:left-60" fill="#A4B494" />
        <FloatingParticles quantity={30} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-sage/20 backdrop-blur-sm text-cream font-medium rounded-full text-sm mb-6 border border-sage/30">
              <span className="w-2 h-2 rounded-full bg-sage animate-pulse" />
              {exhibitors.length > 0 ? `${exhibitors.length} exposants confirmés` : 'Exposants à venir'}
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
              Nos Exposants
            </h1>
            <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
              Découvrez les acteurs de la filière chanvre CBD présents lors du salon
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      {/* Content */}
      <div className="container-custom py-12">
        {/* Category Filter - Mobile Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 -mx-4 px-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 min-w-max pb-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.slug}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  selectedCategory === cat.slug
                    ? 'bg-forest text-white shadow-lg shadow-forest/30'
                    : 'bg-white text-body hover:bg-sage/20 border border-sage/20'
                }`}
              >
                {cat.name}
                <span className="ml-1.5 opacity-70">({cat.count})</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Exhibitors Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-forest/20 border-t-forest rounded-full animate-spin" />
          </div>
        ) : filteredExhibitors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-body/60 text-lg">Les exposants seront bientôt annoncés.</p>
          </div>
        ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-12">
          {filteredExhibitors.map((exhibitor, index) => (
            <motion.div
              key={exhibitor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card variant="elevated" className="group h-full hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <div className="relative h-32 bg-gradient-to-br from-sage/10 to-forest/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    {exhibitor.logoUrl ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-full h-full flex items-center justify-center p-4"
                      >
                        <img
                          src={exhibitor.logoUrl}
                          alt={`Logo ${exhibitor.name}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center"
                      >
                        <svg className="w-8 h-8 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </motion.div>
                    )}
                    <Badge variant="forest" size="sm" className="absolute top-3 right-3">
                      Stand {exhibitor.standNumber}
                    </Badge>
                  </div>

                  <h3 className="font-heading font-semibold text-heading text-lg mb-1 group-hover:text-forest transition-colors">
                    {exhibitor.name}
                  </h3>
                  <Badge variant="sage" size="sm" className="mb-2">
                    {exhibitor.categoryLabel}
                  </Badge>
                  <p className="text-sm text-body/60 mb-4 line-clamp-2">
                    {exhibitor.description || 'Description à venir'}
                  </p>

                  {exhibitor.websiteUrl ? (
                    <a
                      href={exhibitor.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium hover:bg-forest-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Visiter le site
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-body/40 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Site web à venir
                    </span>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}

        </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-forest to-forest-600 rounded-2xl p-8 md:p-12 text-center text-white overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '32px 32px',
            }} />
          </div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              Vous souhaitez exposer ?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Rejoignez les exposants du salon de référence du chanvre CBD.
              Réservez votre stand dès maintenant.
            </p>
            <Link href="/pro">
              <Button size="lg" className="bg-sage hover:bg-sage-600 text-forest">
                Devenir Exposant
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
