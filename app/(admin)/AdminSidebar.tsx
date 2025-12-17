'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

interface AdminSidebarProps {
  user: {
    id: string
    email: string
    name?: string | null
    role: string
  }
}

// Définition des rôles qui peuvent voir chaque item
// SUPER_ADMIN a accès à TOUS les onglets (géré dans le filtrage)
// ADMIN a accès à tout sauf la gestion d'équipe
// CONTRIBUTOR ne voit que Comptes Pro et Stands
const ADMIN_ONLY_ROLES = ['ADMIN']
const CONTRIBUTOR_ROLES = ['ADMIN', 'CONTRIBUTOR']

// Fonction helper pour vérifier si un utilisateur a accès à un item
// SUPER_ADMIN a toujours accès à tout
const hasAccess = (userRole: string, allowedRoles: string[]) => {
  if (userRole === 'SUPER_ADMIN') return true
  return allowedRoles.includes(userRole)
}

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  roles: string[] // Rôles autorisés à voir cet item
}

const STORAGE_KEY = 'admin-nav-order'

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    id: 'sponsors',
    label: 'Sponsors',
    href: '/admin/sponsors',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    id: 'pros',
    label: 'Comptes Pro',
    href: '/admin/pros',
    roles: CONTRIBUTOR_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    id: 'stands',
    label: 'Stands',
    href: '/admin/stands',
    roles: CONTRIBUTOR_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    id: 'programme',
    label: 'Programme',
    href: '/admin/programme',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'billetterie',
    label: 'Billetterie',
    href: '/admin/billetterie',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
  },
  {
    id: 'mediatheque',
    label: 'Médiathèque',
    href: '/admin/mediatheque',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'infos-pratiques',
    label: 'Infos Pratiques',
    href: '/admin/infos-pratiques',
    roles: ADMIN_ONLY_ROLES,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'team',
    label: 'Équipe',
    href: '/admin/team',
    roles: [],
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m9 5.197v-1a6 6 0 00-3-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

// Fonction pour récupérer l'ordre sauvegardé depuis le localStorage
function getSavedOrder(): string[] | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

// Fonction pour sauvegarder l'ordre dans le localStorage
function saveOrder(order: string[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Ignore errors
  }
}

// Fonction pour ordonner les items selon l'ordre sauvegardé
function orderItems(items: NavItem[], savedOrder: string[] | null): NavItem[] {
  if (!savedOrder) return items

  const itemMap = new Map(items.map(item => [item.id, item]))
  const ordered: NavItem[] = []

  // Ajouter les items dans l'ordre sauvegardé
  for (const id of savedOrder) {
    const item = itemMap.get(id)
    if (item) {
      ordered.push(item)
      itemMap.delete(id)
    }
  }

  // Ajouter les items restants (nouveaux items non présents dans l'ordre sauvegardé)
  Array.from(itemMap.values()).forEach(item => {
    ordered.push(item)
  })

  return ordered
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [navItems, setNavItems] = useState<NavItem[]>(defaultNavItems)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const pathname = usePathname()

  // Charger l'ordre sauvegardé au montage
  useEffect(() => {
    const savedOrder = getSavedOrder()
    if (savedOrder) {
      setNavItems(orderItems(defaultNavItems, savedOrder))
    }
  }, [])

  // Handlers pour le drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    setDraggedItem(itemId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', itemId)
    // Ajouter une classe pour le style pendant le drag
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }, [])

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedItem(null)
    setDragOverItem(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (draggedItem && itemId !== draggedItem) {
      setDragOverItem(itemId)
    }
  }, [draggedItem])

  const handleDragLeave = useCallback(() => {
    setDragOverItem(null)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('text/plain')

    if (sourceId && sourceId !== targetId) {
      setNavItems(prevItems => {
        const newItems = [...prevItems]
        const sourceIndex = newItems.findIndex(item => item.id === sourceId)
        const targetIndex = newItems.findIndex(item => item.id === targetId)

        if (sourceIndex !== -1 && targetIndex !== -1) {
          // Retirer l'item source
          const [movedItem] = newItems.splice(sourceIndex, 1)
          // L'insérer à la position cible
          newItems.splice(targetIndex, 0, movedItem)

          // Sauvegarder le nouvel ordre
          const newOrder = newItems.map(item => item.id)
          saveOrder(newOrder)
        }

        return newItems
      })
    }

    setDraggedItem(null)
    setDragOverItem(null)
  }, [])

  // Réinitialiser l'ordre par défaut
  const resetOrder = useCallback(() => {
    setNavItems(defaultNavItems)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  // Create portal for mobile menu button
  useEffect(() => {
    const container = document.getElementById('mobile-menu-button')
    if (container) {
      container.innerHTML = ''
      const button = document.createElement('button')
      button.className = 'lg:hidden p-2 text-gray-600 hover:text-gray-900'
      button.innerHTML = `
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      `
      button.onclick = () => setSidebarOpen(true)
      container.appendChild(button)
    }
  }, [])

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-forest transform transition-transform duration-200 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link href={user.role === 'CONTRIBUTOR' ? '/admin/pros' : '/admin'} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-forest font-bold text-sm">CA</span>
            </div>
            <span className="font-heading font-bold text-white">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {/* Bouton mode édition */}
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
            <button
              onClick={() => setEditMode(!editMode)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                editMode
                  ? 'bg-amber-500 text-white'
                  : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
              )}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {editMode ? 'Terminer' : 'Réorganiser'}
            </button>
            {editMode && (
              <button
                onClick={resetOrder}
                className="text-xs text-white/50 hover:text-white/80 transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Items de navigation */}
          {navItems
            .filter((item) => hasAccess(user.role, item.roles))
            .map((item) => (
              <div
                key={item.id}
                draggable={editMode}
                onDragStart={(e) => editMode && handleDragStart(e, item.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => editMode && handleDragOver(e, item.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => editMode && handleDrop(e, item.id)}
                className={cn(
                  'relative transition-all',
                  editMode && 'cursor-grab active:cursor-grabbing',
                  dragOverItem === item.id && 'transform translate-y-1'
                )}
              >
                {/* Indicateur de drop */}
                {dragOverItem === item.id && draggedItem !== item.id && (
                  <div className="absolute -top-1 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                )}

                <Link
                  href={editMode ? '#' : item.href}
                  onClick={(e) => {
                    if (editMode) {
                      e.preventDefault()
                    } else {
                      setSidebarOpen(false)
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors',
                    pathname === item.href && 'bg-white/10 text-white',
                    editMode && 'hover:bg-white/5',
                    draggedItem === item.id && 'opacity-50'
                  )}
                >
                  {/* Icône de drag en mode édition */}
                  {editMode && (
                    <svg className="w-4 h-4 text-white/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  )}
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              </div>
            ))}
        </nav>

        {/* Bottom Links */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-forest">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Voir le site</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await signOut({ callbackUrl: '/connexion', redirect: true })
            }}
            className="flex items-center gap-3 px-4 py-3 text-white/70 hover:text-white transition-colors w-full text-left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
