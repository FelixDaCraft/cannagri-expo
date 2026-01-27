import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Header, Footer, InfoBanner } from '@/components/layout'
import { PageTracker } from '@/components/analytics'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <PageTracker />
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <InfoBanner />
      <Footer />
    </NextIntlClientProvider>
  )
}
