import type { Metadata } from 'next'
import { Barlow, Barlow_Condensed, Chewy, Modak } from 'next/font/google'
import { siteConfig } from '@/config/site'
import { Providers } from '@/components/Providers'
import { getLocale } from 'next-intl/server'
import { revealBootScript } from '@/lib/reveal'
import './globals.css'

// Polices de l'affiche des 5 ans : Modak (logo-titre et grands titres), Chewy (une annotation
// par écran), Barlow Condensed (infos, surtitres, boutons) et Barlow (texte courant)
const modak = Modak({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-modak',
  display: 'swap',
})

const chewy = Chewy({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-chewy',
  display: 'swap',
})

const barlowCondensed = Barlow_Condensed({
  weight: ['500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-barlow-condensed',
  display: 'swap',
})

const barlow = Barlow({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-barlow',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: '/images/logo-96.png',
    shortcut: '/images/logo-96.png',
    apple: '/images/logo.PNG',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Langue déclarée = langue affichée (lecteurs d'écran, constat n°33)
  const locale = await getLocale()
  return (
    <html
      lang={locale}
      className={`${modak.variable} ${chewy.variable} ${barlowCondensed.variable} ${barlow.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Apparitions au défilement : activées avant l'affichage pour éviter tout clignotement */}
        <script dangerouslySetInnerHTML={{ __html: revealBootScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
