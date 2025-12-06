import { Metadata } from 'next'
import { Card, CardContent, Button, Badge, Input } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Sponsoring',
  description: 'Devenez partenaire du salon Cann\'Agri Expo - Offres de sponsoring Platinum, Or, Argent et Bronze',
}

const sponsorPackages = [
  {
    name: 'Platinum',
    color: 'bg-gradient-to-br from-slate-700 to-slate-900',
    borderColor: 'ring-slate-600',
    description: 'Visibilité maximale et partenariat exclusif',
  },
  {
    name: 'Or',
    color: 'bg-gradient-to-br from-amber-400 to-amber-600',
    borderColor: 'ring-amber-500',
    description: 'Partenariat premium avec forte visibilité',
  },
  {
    name: 'Argent',
    color: 'bg-gradient-to-br from-gray-300 to-gray-400',
    borderColor: 'ring-gray-400',
    description: 'Partenariat avec visibilité ciblée',
  },
  {
    name: 'Bronze',
    color: 'bg-gradient-to-br from-orange-600 to-orange-800',
    borderColor: 'ring-orange-600',
    description: 'Partenariat de soutien',
  },
]

const benefits = [
  {
    title: 'Visibilité',
    description: 'Associez votre marque à l\'événement de référence du secteur CBD.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  },
  {
    title: 'Notoriété',
    description: 'Renforcez votre image de marque auprès des professionnels du secteur.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    title: 'Réseau',
    description: 'Accédez à un réseau privilégié de décideurs et d\'influenceurs.',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

export default function SponsoringPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="forest" className="mb-4">Partenariat</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-heading mb-4">
            Devenez Partenaire
          </h1>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Associez votre marque au salon de référence du chanvre CBD et bénéficiez
            d&apos;une visibilité exceptionnelle.
          </p>
        </div>

        {/* Benefits */}
        <section className="mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-sage/20 flex items-center justify-center text-forest">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-heading font-semibold text-heading mb-2">
                  {benefit.title}
                </h3>
                <p className="text-body/70">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Packages */}
        <section className="mb-16">
          <h2 className="text-3xl font-heading font-bold text-heading text-center mb-4">
            Nos offres de partenariat
          </h2>
          <p className="text-center text-body/70 mb-10 max-w-2xl mx-auto">
            Nous proposons 4 niveaux de partenariat adaptés à vos objectifs.
            Remplissez le formulaire ci-dessous pour recevoir le détail des offres.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {sponsorPackages.map((pkg, index) => (
              <Card
                key={index}
                variant="bordered"
                className={`ring-2 ${pkg.borderColor} overflow-hidden`}
              >
                <div className={`${pkg.color} py-6 px-4 text-center`}>
                  <h3 className="text-2xl font-heading font-bold text-white drop-shadow-md">
                    {pkg.name}
                  </h3>
                </div>
                <CardContent className="p-4 text-center">
                  <p className="text-body/70 text-sm">{pkg.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact Form - without dropdown */}
        <section className="bg-white rounded-2xl p-8 md:p-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-heading font-bold text-heading text-center mb-4">
            Demande de partenariat
          </h2>
          <p className="text-center text-body/70 mb-8">
            Remplissez ce formulaire pour recevoir le détail complet de nos offres de partenariat.
          </p>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Nom"
                name="name"
                placeholder="Votre nom"
                required
              />
              <Input
                label="Entreprise"
                name="company"
                placeholder="Raison sociale"
                required
              />
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="email@entreprise.com"
                required
              />
              <Input
                label="Téléphone"
                name="phone"
                type="tel"
                placeholder="06 00 00 00 00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Message (optionnel)
              </label>
              <textarea
                name="message"
                rows={4}
                placeholder="Décrivez votre projet ou vos besoins spécifiques..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-body placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage resize-none"
              />
            </div>
            <Button type="submit" size="lg" className="w-full">
              Recevoir les offres de partenariat
            </Button>
          </form>
          <p className="text-center text-sm text-body/60 mt-4">
            Notre équipe vous recontactera sous 48h avec le détail de nos offres.
          </p>
        </section>

        {/* Direct Contact */}
        <div className="text-center mt-12">
          <p className="text-body/70 mb-2">Vous préférez nous contacter directement ?</p>
          <a
            href={`mailto:${siteConfig.contact.email}?subject=Demande%20de%20partenariat`}
            className="text-forest font-semibold hover:underline"
          >
            {siteConfig.contact.email}
          </a>
        </div>
      </div>
    </div>
  )
}
