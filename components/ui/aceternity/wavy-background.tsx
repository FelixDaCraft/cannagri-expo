'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createNoise3D } from 'simplex-noise'
import { cn } from '@/lib/utils'

interface WavyBackgroundProps {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: 'slow' | 'fast'
  waveOpacity?: number
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
}) => {
  const noise = createNoise3D()
  let w: number,
    h: number,
    nt: number,
    i: number,
    x: number,
    ctx: CanvasRenderingContext2D | null,
    canvas: HTMLCanvasElement | null
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getSpeed = () => {
    switch (speed) {
      case 'slow':
        return 0.001
      case 'fast':
        return 0.002
      default:
        return 0.001
    }
  }

  const waveColors = colors ?? [
    '#2E4A33', // forest
    '#A4B494', // sage
    '#3d5c42', // forest-light
    '#8a9e7c', // sage-dark
    '#4a6b50', // mid tone
  ]

  const drawWave = (n: number) => {
    nt += getSpeed()
    for (i = 0; i < n; i++) {
      ctx!.beginPath()
      ctx!.lineWidth = waveWidth || 50
      ctx!.strokeStyle = waveColors[i % waveColors.length]
      for (x = 0; x < w; x += 5) {
        const y = noise(x / 800, 0.3 * i, nt) * 100
        ctx!.lineTo(x, y + h * 0.5)
      }
      ctx!.stroke()
      ctx!.closePath()
    }
  }

  let animationId: number

  const render = () => {
    if (!ctx) return
    ctx.fillStyle = backgroundFill || '#F4F1E8' // cream color
    ctx.globalAlpha = waveOpacity
    ctx.fillRect(0, 0, w, h)
    drawWave(5)
    animationId = requestAnimationFrame(render)
  }

  const init = () => {
    canvas = canvasRef.current
    if (!canvas) return
    ctx = canvas.getContext('2d')
    if (!ctx) return
    w = ctx.canvas.width = window.innerWidth
    h = ctx.canvas.height = window.innerHeight
    ctx.filter = `blur(${blur}px)`
    nt = 0
    render()
  }

  useEffect(() => {
    init()
    window.addEventListener('resize', init)
    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', init)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [isSafari, setIsSafari] = useState(false)
  useEffect(() => {
    setIsSafari(
      typeof window !== 'undefined' &&
        navigator.userAgent.includes('Safari') &&
        !navigator.userAgent.includes('Chrome')
    )
  }, [])

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
        style={{
          ...(isSafari ? { filter: `blur(${blur}px)` } : {}),
        }}
      />
      <div className={cn('relative z-10', className)}>{children}</div>
    </div>
  )
}
