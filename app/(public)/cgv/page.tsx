import type { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/config/site'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Conditions générales de vente',
  description: "Conditions générales de vente de la billetterie et des stands du salon Cann'Agri Expo.",
}

const TOC = [
  { id: 'objet', label: '1. Objet' },
  { id: 'billetterie', label: '2. Billetterie' },
  { id: 'reservation-de-stands', label: '3. Réservation de stands' },
  { id: 'responsabilite', label: '4. Responsabilité' },
  { id: 'force-majeure', label: '5. Force majeure' },
  { id: 'propriete-intellectuelle', label: '6. Propriété intellectuelle' },
  { id: 'donnees-personnelles', label: '7. Données personnelles' },
  { id: 'droit-applicable', label: '8. Droit applicable' },
  { id: 'vendeur', label: '9. Vendeur' },
  { id: 'contact', label: '10. Contact' },
]

export default function CGVPage() {
  return (
    <LegalPage title="Conditions générales de vente" updated="Dernière mise à jour : décembre 2025" toc={TOC}>
            <h2 id="objet">1. Objet</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent les ventes de billets d&apos;entrée
              et de réservations de stands pour le salon <strong>{siteConfig.name}</strong>.
            </p>

            <h2 id="billetterie">2. Billetterie</h2>

            <h3>2.1 Types de billets</h3>
            <p>Deux types de billets sont proposés :</p>
            <ul>
              <li><strong>Billet Standard</strong> : Accès au salon pendant les heures d&apos;ouverture au public</li>
              <li><strong>Billet Flex</strong> : Billet de soutien à l&apos;association avec accès au salon</li>
            </ul>

            <h3>2.2 Prix et paiement</h3>
            <p>
              Les prix sont indiqués en euros TTC. Le paiement s&apos;effectue en ligne par carte bancaire
              via notre plateforme de paiement sécurisée Viva Wallet.
            </p>

            <h3>2.3 Confirmation et billets</h3>
            <p>
              Après validation du paiement, un email de confirmation contenant le(s) billet(s) au format PDF
              avec QR code est envoyé à l&apos;adresse email indiquée. Ce QR code devra être présenté à l&apos;entrée
              du salon (version imprimée ou sur smartphone).
            </p>

            <h3>2.4 Annulation et remboursement</h3>
            <p>
              Les billets ne sont ni échangeables ni remboursables, sauf en cas d&apos;annulation de l&apos;événement
              par l&apos;organisateur. En cas de report de l&apos;événement, les billets restent valables pour les
              nouvelles dates.
            </p>

            <h2 id="reservation-de-stands">3. Réservation de stands</h2>

            <h3>3.1 Procédure de réservation</h3>
            <p>
              La réservation d&apos;un stand s&apos;effectue en ligne. Le stand est réservé pendant 30 minutes
              le temps du paiement. Passé ce délai, le stand est remis en vente.
            </p>

            <h3>3.2 Prix et conditions</h3>
            <p>
              Les prix des stands sont indiqués HT. La TVA de 20% s&apos;applique. Des options supplémentaires
              (mobilier, électricité) peuvent être ajoutées lors de la réservation.
            </p>

            <h3>3.3 Acompte et solde</h3>
            <p>
              Un acompte de 30% est demandé à la réservation. Le solde doit être réglé au plus tard
              30 jours avant l&apos;événement.
            </p>

            <h3>3.4 Annulation par l&apos;exposant</h3>
            <ul>
              <li>Plus de 60 jours avant l&apos;événement : remboursement de l&apos;acompte moins 10% de frais</li>
              <li>Entre 30 et 60 jours : acompte non remboursable</li>
              <li>Moins de 30 jours : totalité du montant dû</li>
            </ul>

            <h2 id="responsabilite">4. Responsabilité</h2>
            <p>
              L&apos;organisateur décline toute responsabilité en cas de vol, perte ou détérioration des biens
              des visiteurs et exposants. Les exposants sont tenus de souscrire une assurance responsabilité
              civile couvrant leur participation.
            </p>

            <h2 id="force-majeure">5. Force majeure</h2>
            <p>
              En cas de force majeure (catastrophe naturelle, épidémie, décision gouvernementale, etc.)
              empêchant la tenue de l&apos;événement, l&apos;organisateur se réserve le droit de reporter ou
              d&apos;annuler l&apos;événement. Les conditions de remboursement seront alors communiquées.
            </p>

            <h2 id="propriete-intellectuelle">6. Propriété intellectuelle</h2>
            <p>
              Toute reproduction ou utilisation des éléments visuels et textuels du salon (logo, nom,
              photographies) est interdite sans autorisation préalable écrite de l&apos;organisateur.
            </p>

            <h2 id="donnees-personnelles">7. Données personnelles</h2>
            <p>
              Les données collectées sont traitées conformément au RGPD. Pour plus d&apos;informations,
              consultez notre{' '}
              <Link href="/confidentialite">
                politique de confidentialité
              </Link>.
            </p>

            <h2 id="droit-applicable">8. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux
              de Nantes seront seuls compétents.
            </p>

            <h2 id="vendeur">9. Vendeur</h2>
            <p>
              <strong>PLATINUM CBD</strong><br />
              Association déclarée (loi 1901)<br />
              N° RNA : W442 027 639<br />
              SIRET : 921 098 497 00016<br />
              Siège social : 9 rue de Beaulieu, 44340 Bouguenais, France
            </p>

            <h2 id="contact">10. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales de vente :<br />
              <strong>{siteConfig.name}</strong><br />
              Email :{' '}
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
            </p>

            <div className="mt-12 border-t border-forest/15 pt-6">
              <p>
                Ces conditions générales de vente sont susceptibles d&apos;être modifiées à tout moment.
                La version applicable est celle en vigueur au moment de la commande.
              </p>
            </div>
    </LegalPage>
  )
}
