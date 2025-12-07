import { Metadata } from 'next'
import { Card, CardContent, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Mentions Légales',
  description: 'Mentions légales du site Cann\'Agri Expo',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="forest" className="mb-4">Informations légales</Badge>
            <h1 className="text-4xl font-heading font-bold text-heading mb-4">
              Mentions Légales
            </h1>
            <p className="text-body/70">
              Dernière mise à jour : Décembre 2024
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  1. Éditeur du site
                </h2>
                <p className="text-body/80">
                  Le site <strong>Cann&apos;Agri Expo</strong> ({siteConfig.url}) est édité par :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Raison sociale :</strong> Cann&apos;Agri Expo</li>
                  <li><strong>Forme juridique :</strong> [À compléter]</li>
                  <li><strong>Capital social :</strong> [À compléter]</li>
                  <li><strong>Siège social :</strong> {siteConfig.event.location}</li>
                  <li><strong>SIRET :</strong> [À compléter]</li>
                  <li><strong>RCS :</strong> [À compléter]</li>
                  <li><strong>Numéro TVA intracommunautaire :</strong> [À compléter]</li>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                  <li><strong>Directeur de la publication :</strong> [À compléter]</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  2. Hébergement
                </h2>
                <p className="text-body/80">
                  Le site est hébergé par :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Hébergeur :</strong> [À compléter]</li>
                  <li><strong>Adresse :</strong> [À compléter]</li>
                  <li><strong>Téléphone :</strong> [À compléter]</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  3. Propriété intellectuelle
                </h2>
                <p className="text-body/80">
                  L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.)
                  est la propriété exclusive de Cann&apos;Agri Expo ou de ses partenaires et est protégé
                  par les lois françaises et internationales relatives à la propriété intellectuelle.
                </p>
                <p className="text-body/80">
                  Toute reproduction, représentation, modification, publication, transmission ou
                  dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé
                  que ce soit, et sur quelque support que ce soit est interdite sans l&apos;autorisation
                  écrite préalable de Cann&apos;Agri Expo.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  4. Limitation de responsabilité
                </h2>
                <p className="text-body/80">
                  Les informations contenues sur ce site sont aussi précises que possible et le site
                  est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes,
                  des omissions ou des lacunes.
                </p>
                <p className="text-body/80">
                  Cann&apos;Agri Expo ne pourra être tenue responsable des dommages directs et indirects
                  causés au matériel de l&apos;utilisateur lors de l&apos;accès au site, résultant soit de
                  l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications techniques requises,
                  soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  5. Liens hypertextes
                </h2>
                <p className="text-body/80">
                  Le site peut contenir des liens hypertextes vers d&apos;autres sites internet.
                  Cann&apos;Agri Expo n&apos;exerce aucun contrôle sur ces sites et décline toute
                  responsabilité quant à leur contenu.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  6. Droit applicable
                </h2>
                <p className="text-body/80">
                  Les présentes mentions légales sont régies par le droit français.
                  En cas de litige, les tribunaux français seront seuls compétents.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  7. Contact
                </h2>
                <p className="text-body/80">
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter à :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
