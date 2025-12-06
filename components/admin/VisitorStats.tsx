'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui'

interface AnalyticsData {
  today: {
    views: number
    unique: number
    trend: number
  }
  week: {
    views: number
    unique: number
  }
  month: {
    views: number
    unique: number
  }
  total: number
  topPages: { path: string; views: number }[]
  dailyViews: { date: string; views: number }[]
}

export function VisitorStats() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setData(result.data)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Card variant="default" className="bg-white">
        <CardContent>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const maxViews = Math.max(...data.dailyViews.map(d => d.views), 1)

  return (
    <Card variant="default" className="bg-white">
      <CardContent>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-heading font-semibold text-gray-900">
            Statistiques de visite
          </h2>
          <span className="text-sm text-gray-500">
            Total: {data.total.toLocaleString()} vues
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-600 font-medium uppercase mb-1">Aujourd'hui</p>
            <p className="text-2xl font-bold text-blue-700">{data.today.views}</p>
            <p className="text-xs text-blue-500 mt-1">
              {data.today.unique} visiteurs uniques
            </p>
            {data.today.trend !== 0 && (
              <p className={`text-xs mt-1 ${data.today.trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.today.trend > 0 ? '↑' : '↓'} {Math.abs(data.today.trend)}% vs hier
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <p className="text-xs text-green-600 font-medium uppercase mb-1">Cette semaine</p>
            <p className="text-2xl font-bold text-green-700">{data.week.views}</p>
            <p className="text-xs text-green-500 mt-1">
              {data.week.unique} visiteurs uniques
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <p className="text-xs text-purple-600 font-medium uppercase mb-1">Ce mois</p>
            <p className="text-2xl font-bold text-purple-700">{data.month.views}</p>
            <p className="text-xs text-purple-500 mt-1">
              {data.month.unique} visiteurs uniques
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <p className="text-xs text-orange-600 font-medium uppercase mb-1">Moy. / jour</p>
            <p className="text-2xl font-bold text-orange-700">
              {data.dailyViews.length > 0
                ? Math.round(data.week.views / 7)
                : 0}
            </p>
            <p className="text-xs text-orange-500 mt-1">
              sur 7 jours
            </p>
          </div>
        </div>

        {/* Mini Bar Chart */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Visites des 7 derniers jours</p>
          <div className="flex items-end gap-1 h-24">
            {data.dailyViews.map((day, index) => {
              const height = maxViews > 0 ? (day.views / maxViews) * 100 : 0
              const isToday = index === data.dailyViews.length - 1
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div
                    className={`w-full rounded-t transition-all ${
                      isToday ? 'bg-forest' : 'bg-forest/40'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                    title={`${day.date}: ${day.views} vues`}
                  />
                  <span className="text-[10px] text-gray-500 mt-1">
                    {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top Pages */}
        {data.topPages.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Pages les plus visitées</p>
            <div className="space-y-2">
              {data.topPages.map((page, index) => (
                <div key={page.path} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 truncate max-w-[200px]">
                      {page.path === '/' ? 'Accueil' : page.path}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{page.views}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
