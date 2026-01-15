'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, Button, Badge } from '@/components/ui'
import { formatPrice } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Stand {
  id: string
  number: number
  code: string
  surfaceM2: number
  priceHT: number
  size: 'SMALL' | 'MEDIUM' | 'LARGE'
  hasFurniture: boolean
  hasElectricity: boolean
  furniturePrice: number
  electricityPrice: number
  exhibitorName: string | null
  order: {
    id: string
    orderNumber: string
    amount: number
    amountHT: number
    paidAt: string
    customerName: string
    companyName: string | null
    createdAt: string
  }
}

const sizeLabels: Record<string, string> = {
  SMALL: 'Petit',
  MEDIUM: 'Moyen',
  LARGE: 'Grand',
}

export default function MesStandsPage() {
  const t = useTranslations('account')
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stands, setStands] = useState<Stand[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/connexion?callbackUrl=/compte/stands')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStands()
    }
  }, [session])

  const fetchStands = async () => {
    try {
      const response = await fetch('/api/user/stands')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération des stands')
      }

      setStands(data.stands)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-cream py-12">
        <div className="container-custom">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
          </div>
        </div>
      </div>
    )
  }

  // If not PRO, redirect to account page
  if (session?.user?.role !== 'PRO') {
    router.push('/compte')
    return null
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/compte"
            className="inline-flex items-center text-forest hover:underline mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('stands.backToAccount')}
          </Link>
          <h1 className="text-3xl font-heading font-bold text-heading">
            {t('stands.title')}
          </h1>
          <p className="text-body/70 mt-2">
            {t('stands.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {stands.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
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
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <h2 className="text-xl font-heading font-semibold text-heading mb-2">
                {t('stands.noStands')}
              </h2>
              <p className="text-body/70 mb-6">
                {t('stands.noStandsDescription')}
              </p>
              <Link href="/pro/plan">
                <Button>{t('stands.bookStand')}</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {stands.map((stand) => (
              <Card key={stand.id}>
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-heading font-semibold text-heading">
                          Stand n°{stand.number}
                        </h3>
                        <Badge variant="sage">
                          {sizeLabels[stand.size] || stand.size}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-body/70">
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          {stand.surfaceM2} m²
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {t('stands.order')} {stand.order.orderNumber}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(stand.order.paidAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Options */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {stand.hasFurniture && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-forest/30 text-forest bg-forest/5">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            {t('stands.furniture')}
                          </span>
                        )}
                        {stand.hasElectricity && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border border-forest/30 text-forest bg-forest/5">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {t('stands.electricity')}
                          </span>
                        )}
                      </div>

                      {/* Exhibitor name if set */}
                      {stand.exhibitorName && (
                        <p className="mt-2 text-sm text-forest font-medium">
                          {t('stands.exhibitorName')}: {stand.exhibitorName}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-forest">
                        {formatPrice(stand.order.amount)}
                      </p>
                      <p className="text-xs text-body/50">
                        {formatPrice(stand.order.amountHT)} HT
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary section if user has stands */}
        {stands.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-heading font-semibold text-heading">
                      {t('stands.totalStands')}: {stands.length}
                    </h3>
                    <p className="text-sm text-body/70">
                      {t('stands.totalSurface')}: {stands.reduce((acc, s) => acc + s.surfaceM2, 0)} m²
                    </p>
                  </div>
                  <Link href="/pro/plan">
                    <Button variant="outline">
                      {t('stands.bookAnotherStand')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
