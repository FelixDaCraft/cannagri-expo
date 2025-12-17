import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { AdminSidebar } from './AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/connexion?callbackUrl=/admin')
  }

  // Check if user has an admin role
  const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR']
  if (!allowedRoles.includes(session.user.role)) {
    redirect('/?error=unauthorized')
  }

  // Role labels for display
  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Administrateur',
    CONTRIBUTOR: 'Contributeur',
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar user={session.user} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          {/* Mobile menu button - handled by AdminSidebar */}
          <div id="mobile-menu-button" />

          <div className="flex-1" />

          {/* User menu */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user.name || session.user.email}</p>
              <p className="text-xs text-gray-500">{roleLabels[session.user.role] || session.user.role}</p>
            </div>
            <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {(session.user.name || session.user.email || 'A').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
