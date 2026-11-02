import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import { getActiveEditionView, editionService } from '@/lib/editions'
import { EditionProvider } from '@/components/editions'
import { Header, Footer } from '@/components/layout'

export default async function ProLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const [edition, showPastEditions] = await Promise.all([
    getActiveEditionView(),
    editionService.hasPublishedArchives(),
  ])

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <EditionProvider edition={edition}>
        <Header showPastEditions={showPastEditions} />
        <main id="contenu" tabIndex={-1} className="flex-1 pt-16 outline-none lg:pt-[72px]">
          {children}
        </main>
        <Footer />
      </EditionProvider>
    </NextIntlClientProvider>
  )
}
