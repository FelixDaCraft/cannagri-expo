'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode'
import { Button, Card, CardContent } from '@/components/ui'

interface ScanResult {
  valid: boolean
  error?: string
  message?: string
  ticket?: {
    id: string
    customerName: string
    customerEmail?: string
    ticketType: string
    ticketTypeLabel: string
    orderNumber?: string
    scannedAt?: string
  }
}

export default function ControlePage() {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const [scanCount, setScanCount] = useState({ total: 0, valid: 0, invalid: 0 })
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  const verifyTicket = async (qrData: string, markAsUsed = true) => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, markAsUsed }),
      })

      const data: ScanResult = await res.json()
      setResult(data)

      setScanCount(prev => ({
        total: prev.total + 1,
        valid: data.valid ? prev.valid + 1 : prev.valid,
        invalid: data.valid ? prev.invalid : prev.invalid + 1,
      }))

      // Play sound feedback
      if (data.valid) {
        playSuccessSound()
      } else {
        playErrorSound()
      }
    } catch {
      setResult({
        valid: false,
        error: 'Erreur de connexion',
        message: 'Impossible de verifier le billet'
      })
    } finally {
      setLoading(false)
    }
  }

  const playSuccessSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }

  const playErrorSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU')
      audio.volume = 0.3
      audio.play().catch(() => {})
    } catch {}
  }

  const startScanning = () => {
    setScanning(true)
    setResult(null)
  }

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => {
    if (scanning && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
        },
        false
      )

      scanner.render(
        (decodedText) => {
          verifyTicket(decodedText)
          // Don't stop scanning - allow multiple scans
        },
        (error) => {
          // Ignore scan errors (no QR code in frame)
          console.debug('Scan error:', error)
        }
      )

      scannerRef.current = scanner
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [scanning])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      verifyTicket(manualCode.trim())
      setManualCode('')
    }
  }

  const resetResult = () => {
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-forest p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Controle Entrees</h1>
            <p className="text-sm text-white/70">Cann Agri Expo 2025</p>
          </div>
          <div className="text-right text-sm">
            <div className="text-green-400">{scanCount.valid} valides</div>
            <div className="text-red-400">{scanCount.invalid} invalides</div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Result Display */}
        {result && (
          <Card className={`border-4 ${result.valid ? 'border-green-500 bg-green-900/50' : 'border-red-500 bg-red-900/50'}`}>
            <CardContent className="p-6 text-center">
              {/* Icon */}
              <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${result.valid ? 'bg-green-500' : 'bg-red-500'}`}>
                {result.valid ? (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>

              {/* Status */}
              <h2 className={`text-2xl font-bold mb-2 ${result.valid ? 'text-green-400' : 'text-red-400'}`}>
                {result.valid ? 'ENTREE AUTORISEE' : 'ENTREE REFUSEE'}
              </h2>

              {/* Error message */}
              {result.error && (
                <p className="text-lg text-red-300 mb-2">{result.error}</p>
              )}

              {/* Ticket info */}
              {result.ticket && (
                <div className="mt-4 p-4 bg-black/30 rounded-lg text-left">
                  <div className="grid gap-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nom:</span>
                      <span className="font-bold">{result.ticket.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className={`font-bold ${
                        result.ticket.ticketType === 'FLEX' ? 'text-terracotta' : 'text-sage'
                      }`}>
                        {result.ticket.ticketTypeLabel}
                      </span>
                    </div>
                    {result.ticket.orderNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Commande:</span>
                        <span className="font-mono text-sm">{result.ticket.orderNumber}</span>
                      </div>
                    )}
                    {result.ticket.scannedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Scanne le:</span>
                        <span className="text-sm">{new Date(result.ticket.scannedAt).toLocaleString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Message */}
              {result.message && (
                <p className="mt-4 text-sm text-gray-300">{result.message}</p>
              )}

              {/* Reset button */}
              <Button onClick={resetResult} className="mt-6 w-full" variant="outline">
                Scanner un autre billet
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scanner */}
        {!result && (
          <>
            {scanning ? (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div id="qr-reader" className="w-full"></div>
                  <Button onClick={stopScanning} className="w-full mt-4" variant="outline">
                    Arreter le scan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 bg-forest/20 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold mb-2">Scanner un billet</h2>
                  <p className="text-gray-400 mb-6">Utilisez la camera pour scanner le QR code du billet</p>
                  <Button onClick={startScanning} className="w-full bg-forest hover:bg-forest/80">
                    Demarrer le scan
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Manual input */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-2">Saisie manuelle</h3>
                <form onSubmit={handleManualSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="CANNAGRI-xxx-xxx-xxx"
                    autoComplete="off"
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                  />
                  <Button type="submit" disabled={loading || !manualCode.trim()}>
                    {loading ? '...' : 'OK'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}
