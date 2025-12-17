import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { Header, Footer } from '@/components/layout'

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <Footer />
    </NextIntlClientProvider>
  )
}
