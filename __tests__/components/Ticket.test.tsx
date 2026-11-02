import { render, screen } from '@testing-library/react'
import { Ticket } from '@/components/ui/Ticket'
import { ButtonLink } from '@/components/ui/ButtonLink'

describe('Ticket', () => {
  it('affiche le nom, le prix sur le talon et l’annotation', () => {
    render(<Ticket name="Billet Flex" price={25} unit="euros" tag="merci" tone="flex" description="La même entrée." />)
    expect(screen.getByRole('heading', { name: /Billet Flex/ })).toBeInTheDocument()
    expect(screen.getByText('25')).toHaveClass('font-display')
    expect(screen.getByText('euros')).toBeInTheDocument()
    expect(screen.getByText('merci')).toHaveClass('font-accent')
    expect(screen.getByRole('article')).toHaveClass('bg-mascot-deep')
  })

  it('rend le contenu ajouté sous la description', () => {
    render(
      <Ticket name="Billet Standard" price={15} unit="euros">
        <button type="button">Ajouter</button>
      </Ticket>
    )
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeInTheDocument()
    expect(screen.getByRole('article')).toHaveClass('bg-forest')
  })
})

describe('ButtonLink', () => {
  it('est un seul lien focalisable, en or par défaut', () => {
    render(<ButtonLink href="/billetterie">Billetterie</ButtonLink>)
    const link = screen.getByRole('link', { name: 'Billetterie' })
    expect(link).toHaveAttribute('href', '/billetterie')
    expect(link).toHaveClass('bg-mint')
    expect(link.querySelector('button')).toBeNull()
  })

  it('applique le ton demandé', () => {
    render(
      <ButtonLink href="/sponsoring" tone="night">
        Plaquette
      </ButtonLink>
    )
    expect(screen.getByRole('link', { name: 'Plaquette' })).toHaveClass('bg-forest')
  })
})
