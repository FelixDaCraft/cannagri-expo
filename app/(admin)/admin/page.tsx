import { Metadata } from 'next'
import Link from 'next/link'
import { StatsGrid, VisitorStats } from '@/components/admin'
import { Card, CardContent, Badge } from '@/components/ui'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
}

// Mock data for development
const mockStats = {
  totalTicketsSold: 127,
  totalRevenue: 4250,
  standsAvailable: 12,
  standsSold: 8,
  totalSponsors: 6,
  premiumSponsors: 2,
}

const recentOrders = [
  { id: '1', type: 'Billet', customer: 'Jean Dupont', amount: 25, status: 'PAID', date: '2024-12-05' },
  { id: '2', type: 'Stand', customer: 'CBD France', amount: 650, status: 'PAID', date: '2024-12-04' },
  { id: '3', type: 'Billet', customer: 'Marie Martin', amount: 75, status: 'PAID', date: '2024-12-04' },
  { id: '4', type: 'Stand', customer: 'GreenTech', amount: 450, status: 'PENDING', date: '2024-12-03' },
]

const quickActions = [
  { label: 'Nouveau sponsor', href: '/admin/sponsors/new', icon: '⭐' },
  { label: 'Gérer les stands', href: '/admin/stands', icon: '🗺️' },
  { label: 'Exporter les billets', href: '/admin/billetterie', icon: '📥' },
  { label: 'Ajouter des photos', href: '/admin/mediatheque', icon: '📷' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600">Vue d&apos;ensemble de Cann&apos;Agri Expo</p>
      </div>

      {/* Stats */}
      <StatsGrid stats={mockStats} />

      {/* Visitor Stats */}
      <VisitorStats />

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="flex items-center gap-3">
                <span className="text-2xl">{action.icon}</span>
                <span className="font-medium text-gray-900">{action.label}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <Card variant="default" className="bg-white">
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-heading font-semibold text-gray-900">
              Commandes récentes
            </h2>
            <Link href="/admin/billetterie" className="text-sm text-forest hover:underline">
              Voir tout
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="py-3">
                      <Badge variant={order.type === 'Stand' ? 'forest' : 'sage'} size="sm">
                        {order.type}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-900">{order.customer}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{order.amount}€</td>
                    <td className="py-3">
                      <Badge
                        variant={order.status === 'PAID' ? 'success' : 'warning'}
                        size="sm"
                      >
                        {order.status === 'PAID' ? 'Payé' : 'En attente'}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-gray-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card variant="default" className="bg-white">
          <CardContent>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Répartition des stands
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Libres</span>
                <span className="font-semibold text-green-600">12</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Réservés</span>
                <span className="font-semibold text-orange-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vendus</span>
                <span className="font-semibold text-red-600">5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="bg-white">
          <CardContent>
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-4">
              Répartition des billets
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Visiteur</span>
                <span className="font-semibold">78</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pass Pro</span>
                <span className="font-semibold">42</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">VIP</span>
                <span className="font-semibold">7</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
