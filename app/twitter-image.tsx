import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = "Cann'Agri Expo 2026 | Salon Professionnel du Chanvre CBD"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2D5A3D 0%, #1a3d28 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo container */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cannagri-expo.eu/images/logo.PNG"
            alt="Logo"
            width={280}
            height={280}
            style={{
              borderRadius: '50%',
            }}
          />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#F4F1E8',
            textAlign: 'center',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          Cann&apos;Agri Expo 2026
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: '#A4B494',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Salon Professionnel du Chanvre CBD
        </div>

        {/* Event details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            fontSize: 22,
            color: '#F4F1E8',
            opacity: 0.9,
          }}
        >
          <span>28 Mars 2026</span>
          <span style={{ color: '#A4B494' }}>•</span>
          <span>L&apos;Agronaute, Nantes</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
