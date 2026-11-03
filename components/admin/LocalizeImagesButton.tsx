'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'

/** Rattrapage des images externes (logos, photos d'intervenants) : copie sur le site */
export function LocalizeImagesButton() {
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'error'>('idle')
  const [report, setReport] = useState<{ copied: string[]; failed: string[] } | null>(null)

  const run = async () => {
    setState('running')
    try {
      const res = await fetch('/api/admin/images/localize', { method: 'POST' })
      if (!res.ok) throw new Error()
      setReport(await res.json())
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={run} isLoading={state === 'running'}>
        Rapatrier les images externes
      </Button>
      {state === 'error' && <p role="alert" className="notice-error">Le rattrapage n&apos;a pas abouti.</p>}
      {state === 'done' && report && (
        <div role="status" className="notice-success text-sm">
          <p>{report.copied.length} image(s) copiée(s) sur le site, {report.failed.length} échec(s).</p>
          {report.failed.length > 0 && (
            <ul className="mt-1 list-disc pl-5">
              {report.failed.map((line) => <li key={line} className="break-all">{line}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
