import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { StatsGrid, VisitorStats } from '@/components/admin'
import { Card, CardContent, Badge } from '@/components/ui'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Dashboard Admin',
}

// Fonction pour récupérer les statistiques réelles
async function getStats() {
  const [
    ticketsSold,
    ticketsStandard,
    ticketsFlex,
    totalRevenue,
    standsFree,
    standsReserved,
    standsSold,
    totalSponsors,
    premiumSponsors,
  ] = await Promise.all([
    // Nombre de billets vendus (status PAID)
    prisma.ticket.count({
      where: { status: 'PAID' }
    }),
    // Billets Standard vendus
    prisma.ticket.count({
      where: { status: 'PAID', ticketType: 'STANDARD' }
    }),
    // Billets Flex vendus
    prisma.ticket.count({
      where: { status: 'PAID', ticketType: 'FLEX' }
    }),
    // Chiffre d'affaires total (commandes payées)
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true }
    }),
    // Stands libres (status FREE)
    prisma.stand.count({
      where: { status: 'FREE' }
    }),
    // Stands réservés (status RESERVED)
    prisma.stand.count({
      where: { status: 'RESERVED' }
    }),
    // Stands vendus (status SOLD)
    prisma.stand.count({
      where: { status: 'SOLD' }
    }),
    // Total des sponsors actifs
    prisma.sponsor.count({
      where: { isActive: true }
    }),
    // Sponsors premium (PLATINE ou OR)
    prisma.sponsor.count({
      where: {
        isActive: true,
        type: { in: ['PLATINE', 'OR'] }
      }
    }),
  ])

  const totalStands = standsFree + standsReserved + standsSold

  return {
    totalTicketsSold: ticketsSold,
    ticketsStandard,
    ticketsFlex,
    totalRevenue: totalRevenue._sum.amount || 0,
    standsAvailable: standsFree,
    standsSold: standsSold + standsReserved,
    standsFree,
    standsReserved,
    standsOccupied: standsSold,
    totalStands,
    totalSponsors,
    premiumSponsors,
  }
}

// Fonction pour récupérer les commandes récentes
async function getRecentOrders() {
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      tickets: true,
      stands: true,
    }
  })

  return orders.map(order => ({
    id: order.id,
    type: order.type === 'VISITOR_TICKET' ? 'Billet' : 'Stand',
    customer: order.customerName,
    amount: order.amount,
    status: order.status,
    date: order.createdAt.toISOString().split('T')[0],
  }))
}

const quickActions = [
  { label: 'Nouveau sponsor', href: '/admin/sponsors?new=true', icon: '⭐' },
  { label: 'Gérer les stands', href: '/admin/stands', icon: '🗺️' },
  { label: 'Exporter les billets', href: '/admin/billetterie', icon: '📥' },
  { label: 'Ajouter des photos', href: '/admin/mediatheque', icon: '📷' },
]

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const userRole = session?.user?.role || 'CONTRIBUTOR'

  // Redirect CONTRIBUTOR to Comptes Pro page
  if (userRole === 'CONTRIBUTOR') {
    redirect('/admin/pros')
  }

  // Récupérer les vraies statistiques et commandes
  const [stats, recentOrders] = await Promise.all([
    getStats(),
    getRecentOrders()
  ])

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
      <StatsGrid stats={stats} />
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
                <span className="font-semibold text-green-600">{stats.standsFree}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: stats.totalStands > 0 ? `${(stats.standsFree / stats.totalStands) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Réservés</span>
                <span className="font-semibold text-orange-600">{stats.standsReserved}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vendus</span>
                <span className="font-semibold text-red-600">{stats.standsOccupied}</span>
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
                <span className="text-gray-600">Standard</span>
                <span className="font-semibold">{stats.ticketsStandard}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Flex</span>
                <span className="font-semibold">{stats.ticketsFlex}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
