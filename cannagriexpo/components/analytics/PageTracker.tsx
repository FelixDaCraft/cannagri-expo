'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) return

    // Track page view
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname }),
    }).catch(() => {
      // Ignore errors silently
    })
  }, [pathname])

  return null
}
