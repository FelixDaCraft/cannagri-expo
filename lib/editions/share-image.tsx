import { ImageResponse } from 'next/og'
import { getActiveEdition, formatEditionDate } from '@/lib/editions'

export const shareImageSize = {
  width: 1200,
  height: 630,
}

export async function renderShareImage() {
  // Image de partage de l'édition en ligne ; repli générique si la base est indisponible
  const edition = await getActiveEdition().catch(() => null)
  const title = edition ? `Cann'Agri Expo ${edition.year}` : "Cann'Agri Expo"
  const details = edition
    ? [formatEditionDate(edition.startAt), [edition.venueName, edition.city].filter(Boolean).join(', ')].filter(Boolean)
    : []

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
          {title}
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
          {details.map((detail, i) => (
            <span key={detail} style={{ display: 'flex', gap: 24 }}>
              {i > 0 && <span style={{ color: '#A4B494' }}>•</span>}
              <span>{detail}</span>
            </span>
          ))}
        </div>
      </div>
    ),
    {
      ...shareImageSize,
    }
  )
}
