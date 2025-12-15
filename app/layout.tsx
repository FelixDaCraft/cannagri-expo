import type { Metadata } from 'next'
import { Open_Sans, Roboto_Slab } from 'next/font/google'
import { siteConfig } from '@/config/site'
import { Providers } from '@/components/Providers'
import './globals.css'

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: siteConfig.name }],
  icons: {
    icon: '/images/logo.PNG',
    shortcut: '/images/logo.PNG',
    apple: '/images/logo.PNG',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [
      {
        url: `${siteConfig.url}/images/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: [`${siteConfig.url}/images/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${openSans.variable} ${robotoSlab.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
