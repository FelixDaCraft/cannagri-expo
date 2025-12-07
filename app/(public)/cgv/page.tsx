import { Metadata } from 'next'
import Link from 'next/link'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente | Cann\'Agri Expo',
  description: 'Conditions générales de vente pour la billetterie et les stands du salon Cann\'Agri Expo.',
}

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-cream pt-24 pb-16">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-forest mb-4">
              Conditions Générales de Vente
            </h1>
            <p className="text-forest/70">
              Dernière mise à jour : Janvier 2025
            </p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm prose prose-forest max-w-none">
            <h2>1. Objet</h2>
            <p>
              Les présentes conditions générales de vente (CGV) régissent les ventes de billets d&apos;entrée
              et de réservations de stands pour le salon <strong>{siteConfig.name}</strong>.
            </p>

            <h2>2. Billetterie</h2>

            <h3>2.1 Types de billets</h3>
            <p>Plusieurs types de billets sont proposés :</p>
            <ul>
              <li><strong>Billet Visiteur</strong> : Accès au salon pendant les heures d&apos;ouverture au public</li>
              <li><strong>Pass Pro</strong> : Accès prioritaire et avantages professionnels</li>
              <li><strong>Pass VIP</strong> : Accès privilégié, espace lounge et cadeaux</li>
            </ul>

            <h3>2.2 Prix et paiement</h3>
            <p>
              Les prix sont indiqués en euros TTC. Le paiement s&apos;effectue en ligne par carte bancaire
              via notre plateforme de paiement sécurisée Stripe.
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

            <h2>3. Réservation de stands</h2>

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

            <h2>4. Responsabilité</h2>
            <p>
              L&apos;organisateur décline toute responsabilité en cas de vol, perte ou détérioration des biens
              des visiteurs et exposants. Les exposants sont tenus de souscrire une assurance responsabilité
              civile couvrant leur participation.
            </p>

            <h2>5. Force majeure</h2>
            <p>
              En cas de force majeure (catastrophe naturelle, épidémie, décision gouvernementale, etc.)
              empêchant la tenue de l&apos;événement, l&apos;organisateur se réserve le droit de reporter ou
              d&apos;annuler l&apos;événement. Les conditions de remboursement seront alors communiquées.
            </p>

            <h2>6. Propriété intellectuelle</h2>
            <p>
              Toute reproduction ou utilisation des éléments visuels et textuels du salon (logo, nom,
              photographies) est interdite sans autorisation préalable écrite de l&apos;organisateur.
            </p>

            <h2>7. Données personnelles</h2>
            <p>
              Les données collectées sont traitées conformément au RGPD. Pour plus d&apos;informations,
              consultez notre{' '}
              <Link href="/confidentialite" className="text-terracotta hover:underline">
                politique de confidentialité
              </Link>.
            </p>

            <h2>8. Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux
              de Marseille seront seuls compétents.
            </p>

            <h2>9. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales de vente :<br />
              <strong>{siteConfig.name}</strong><br />
              Email :{' '}
              <a href={`mailto:${siteConfig.contact.email}`} className="text-terracotta hover:underline">
                {siteConfig.contact.email}
              </a><br />
              Téléphone : {siteConfig.contact.phone}
            </p>

            <div className="mt-12 pt-8 border-t border-forest/10">
              <p className="text-sm text-forest/60">
                Ces conditions générales de vente sont susceptibles d&apos;être modifiées à tout moment.
                La version applicable est celle en vigueur au moment de la commande.
              </p>
            </div>
          </div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-terracotta hover:underline">
              &larr; Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
