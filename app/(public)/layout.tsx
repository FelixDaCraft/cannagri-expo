import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { getActiveEditionView } from '@/lib/editions'
import { EditionProvider } from '@/components/editions'
import { Header, Footer, InfoBanner } from '@/components/layout'
import { PageTracker } from '@/components/analytics'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const edition = await getActiveEditionView()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EditionProvider edition={edition}>
        <PageTracker />
        <Header />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <InfoBanner />
        <Footer />
      </EditionProvider>
    </NextIntlClientProvider>
  )
}
