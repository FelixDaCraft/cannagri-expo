import { Header, Footer, InfoBanner } from '@/components/layout'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <InfoBanner />
      <Footer />
    </>
  )
}
