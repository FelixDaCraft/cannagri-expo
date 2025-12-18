'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ScanResult {
  valid: boolean
  error?: string
  ticket?: {
    customerName: string
    ticketType: string
    ticketTypeLabel: string
  }
}

export default function ScanPage() {
  const router = useRouter()
  const [result, setResult] = useState<ScanResult | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [audioEnabled, setAudioEnabled] = useState(false)
  const scannerRef = useRef<any>(null)
  const isProcessingRef = useRef(false)
  const successAudioRef = useRef<HTMLAudioElement | null>(null)

  // Preload audio on mount
  useEffect(() => {
    const audio = new Audio('/assets/success-sound.mp3')
    audio.preload = 'auto'
    audio.load()
    successAudioRef.current = audio
  }, [])

  // Unlock audio on mobile (requires user interaction)
  const enableAudio = useCallback(() => {
    if (successAudioRef.current) {
      // Play and immediately pause to unlock audio on iOS
      successAudioRef.current.volume = 0.01
      successAudioRef.current.play().then(() => {
        successAudioRef.current!.pause()
        successAudioRef.current!.currentTime = 0
        successAudioRef.current!.volume = 1.0
        setAudioEnabled(true)
      }).catch(e => {
        console.log('Could not unlock audio:', e)
        setAudioEnabled(true) // Still mark as enabled to hide button
      })
    } else {
      setAudioEnabled(true)
    }
  }, [])

  const playSuccessSound = useCallback(() => {
    try {
      if (successAudioRef.current) {
        successAudioRef.current.currentTime = 0
        successAudioRef.current.volume = 1.0
        const playPromise = successAudioRef.current.play()
        if (playPromise) {
          playPromise.catch(e => {
            console.log('Could not play preloaded audio, trying new instance:', e)
            // Fallback: create new audio instance
            const audio = new Audio('/assets/success-sound.mp3')
            audio.play().catch(err => console.log('Fallback audio failed:', err))
          })
        }
      } else {
        const audio = new Audio('/assets/success-sound.mp3')
        audio.play().catch(e => console.log('Could not play audio:', e))
      }
    } catch (e) {
      console.log('Audio not supported:', e)
    }
  }, [])

  const playErrorSound = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      oscillator.frequency.value = 200
      oscillator.type = 'square'
      gainNode.gain.setValueAtTime(0.5, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Audio not supported')
    }
  }, [])

  const verifyTicket = useCallback(async (qrData: string) => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    // Pause scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.pause(true)
      } catch (e) {
        console.log('Could not pause scanner')
      }
    }

    try {
      const res = await fetch('/api/tickets/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrData, markAsUsed: true }),
      })

      const data: ScanResult = await res.json()
      setResult(data)

      if (data.valid) {
        playSuccessSound()
      } else {
        playErrorSound()
      }

      // Auto reset after delay
      setTimeout(async () => {
        setResult(null)
        isProcessingRef.current = false
        // Resume scanner
        if (scannerRef.current) {
          try {
            await scannerRef.current.resume()
          } catch (e) {
            console.log('Could not resume scanner')
          }
        }
      }, data.valid ? 3000 : 2000)

    } catch (e) {
      console.error('Verification error:', e)
      setResult({
        valid: false,
        error: 'Erreur de connexion'
      })
      playErrorSound()
      setTimeout(async () => {
        setResult(null)
        isProcessingRef.current = false
        if (scannerRef.current) {
          try {
            await scannerRef.current.resume()
          } catch (e) {
            console.log('Could not resume scanner')
          }
        }
      }, 2000)
    }
  }, [playSuccessSound, playErrorSound])

  useEffect(() => {
    let mounted = true

    const initScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')

        if (!mounted) return

        const html5Qrcode = new Html5Qrcode('qr-reader', { verbose: false })
        scannerRef.current = html5Qrcode

        await html5Qrcode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            verifyTicket(decodedText)
          },
          () => {
            // Ignore - no QR found
          }
        )

        if (mounted) {
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Camera error:', err)
        if (!mounted) return

        setIsLoading(false)

        const errorMessage = err instanceof Error ? err.message : String(err)

        if (errorMessage.includes('Permission') || errorMessage.includes('denied') || errorMessage.includes('NotAllowed')) {
          setCameraError('Accès caméra refusé. Autorisez l\'accès dans les paramètres du navigateur.')
        } else if (errorMessage.includes('NotFound') || errorMessage.includes('not found')) {
          setCameraError('Aucune caméra détectée sur cet appareil.')
        } else if (errorMessage.includes('NotReadable') || errorMessage.includes('in use')) {
          setCameraError('La caméra est utilisée par une autre application.')
        } else {
          setCameraError(`Erreur caméra: ${errorMessage}`)
        }
      }
    }

    // Delay to ensure DOM is fully ready
    const timer = setTimeout(initScanner, 500)

    return () => {
      mounted = false
      clearTimeout(timer)

      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
        scannerRef.current = null
      }
    }
  }, [verifyTicket])

  const handleClose = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    router.push('/admin/controle')
  }, [router])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-forest p-4 flex items-center justify-between flex-shrink-0">
        <h1 className="text-white font-bold text-lg">Scanner un billet</h1>
        <button
          onClick={handleClose}
          className="text-white/80 hover:text-white p-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* QR Reader - Always in DOM */}
        <div
          id="qr-reader"
          className="w-full h-full"
          style={{
            minHeight: '400px',
            display: cameraError ? 'none' : 'block'
          }}
        />

        {/* Loading */}
        {isLoading && !cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Initialisation de la caméra...</p>
            </div>
          </div>
        )}

        {/* Camera Error */}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black p-6">
            <div className="text-center">
              <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-white text-lg mb-4">{cameraError}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-white text-black rounded-lg font-medium"
              >
                Retour
              </button>
            </div>
          </div>
        )}

        {/* Result Overlay */}
        {result && (
          <div className={`absolute inset-0 flex items-center justify-center ${result.valid ? 'bg-green-600' : 'bg-red-600'}`}>
            <div className="text-center p-8">
              {result.valid ? (
                <>
                  <svg className="w-24 h-24 text-white mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  <h2 className="text-4xl font-bold text-white mb-2">Welcome</h2>
                  <p className="text-3xl text-white/90 font-medium">
                    {result.ticket?.customerName}
                  </p>
                  {result.ticket?.ticketTypeLabel && (
                    <p className="text-xl text-white/70 mt-2">
                      {result.ticket.ticketTypeLabel}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <svg className="w-24 h-24 text-white mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <h2 className="text-4xl font-bold text-white mb-2">Nop!</h2>
                  <p className="text-2xl text-white/90">Try Again</p>
                  {result.error && (
                    <p className="text-lg text-white/70 mt-2">{result.error}</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Scanning indicator */}
        {!isLoading && !cameraError && !result && (
          <div className="absolute bottom-8 left-0 right-0 text-center">
            {!audioEnabled ? (
              <button
                onClick={enableAudio}
                className="bg-forest text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Activer le son
              </button>
            ) : (
              <p className="text-white text-lg bg-black/50 inline-block px-4 py-2 rounded-full pointer-events-none">
                Placez le QR code dans le cadre
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
