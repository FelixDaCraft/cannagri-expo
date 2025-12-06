import {
  HeroSection,
  CountdownTimer,
  TicketSection,
  PillarsSection,
  ProgramHighlight,
  SponsorsArticlesPlaceholder,
  PartnersGridStatic,
} from '@/components/home'

export default function HomePage() {
  // In production, this would fetch data from the database
  // const sponsors = await prisma.sponsor.findMany({ where: { isActive: true } })
  // const highlightedEvent = await prisma.event.findFirst({ where: { isHighlighted: true } })

  return (
    <>
      <HeroSection />
      <CountdownTimer />
      <TicketSection />
      <PillarsSection />
      <SponsorsArticlesPlaceholder />
      <ProgramHighlight />
      <PartnersGridStatic />
    </>
  )
}
