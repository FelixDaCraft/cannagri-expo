'use client'

import { createContext, useContext } from 'react'
import type { EditionView } from '@/lib/editions/format'

const EditionContext = createContext<EditionView | null>(null)

export function EditionProvider({ edition, children }: { edition: EditionView; children: React.ReactNode }) {
  return <EditionContext.Provider value={edition}>{children}</EditionContext.Provider>
}

/** Édition affichée par la page courante (l'édition active, ou l'édition archivée consultée). */
export function useEdition(): EditionView {
  const edition = useContext(EditionContext)
  if (!edition) throw new Error('useEdition doit être utilisé sous <EditionProvider>')
  return edition
}
