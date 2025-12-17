import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

// Rôles avec accès à l'administration
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'CONTRIBUTOR']

// Rôles avec accès complet (sauf gestion des rôles)
const FULL_ACCESS_ROLES = ['SUPER_ADMIN', 'ADMIN']

// Rôles éditoriaux (peuvent gérer le contenu)
const EDITORIAL_ROLES = ['SUPER_ADMIN', 'ADMIN']

/**
 * Check if the current user has admin access (any admin role)
 * Returns the session if authorized, null otherwise
 */
export async function checkAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  if (!ADMIN_ROLES.includes(session.user.role)) {
    return null
  }

  return session
}

/**
 * Check if the current user has full admin access (not contributor)
 */
export async function checkFullAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  if (!FULL_ACCESS_ROLES.includes(session.user.role)) {
    return null
  }

  return session
}

/**
 * Check if the current user is a SUPER_ADMIN (can manage roles and invitations)
 */
export async function checkSuperAdminAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  if (session.user.role !== 'SUPER_ADMIN') {
    return null
  }

  return session
}

/**
 * Check if the current user can access Pro management (CONTRIBUTOR and above)
 */
export async function checkProManagementAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // CONTRIBUTOR peut gérer les comptes Pro et les stands
  if (!ADMIN_ROLES.includes(session.user.role)) {
    return null
  }

  return session
}

/**
 * Check if the user has editorial access
 */
export async function checkEditorialAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  if (!EDITORIAL_ROLES.includes(session.user.role)) {
    return null
  }

  return session
}

/**
 * Returns an unauthorized response for API routes
 */
export function unauthorizedResponse(message = 'Non autorisé') {
  return NextResponse.json(
    { error: message },
    { status: 401 }
  )
}

/**
 * Returns a forbidden response for API routes
 */
export function forbiddenResponse(message = 'Accès interdit') {
  return NextResponse.json(
    { error: message },
    { status: 403 }
  )
}

/**
 * Helper to check if a role can be assigned by the current user
 */
export function canAssignRole(currentRole: string, targetRole: string): boolean {
  // Only SUPER_ADMIN can assign roles
  if (currentRole !== 'SUPER_ADMIN') {
    return false
  }

  // Cannot create another SUPER_ADMIN
  if (targetRole === 'SUPER_ADMIN') {
    return false
  }

  return true
}
