import { Header, Footer } from '@/components/layout'

export default function ProLayout({
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
      <Footer />
    </>
  )
}
