import { Header, Footer, InfoBanner } from '@/components/layout'
import { PageTracker } from '@/components/analytics'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <PageTracker />
      <Header />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <InfoBanner />
      <Footer />
    </>
  )
}
