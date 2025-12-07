import { Metadata } from 'next'
import { Card, CardContent, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles - Cann\'Agri Expo',
}

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="forest" className="mb-4">RGPD</Badge>
            <h1 className="text-4xl font-heading font-bold text-heading mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-body/70">
              Dernière mise à jour : Décembre 2024
            </p>
          </div>

          <Card className="shadow-lg">
            <CardContent className="p-8 prose prose-lg max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  1. Introduction
                </h2>
                <p className="text-body/80">
                  La présente politique de confidentialité définit la manière dont Cann&apos;Agri Expo
                  collecte, utilise, conserve et protège vos données personnelles conformément au
                  Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
                  et Libertés.
                </p>
                <p className="text-body/80">
                  En utilisant notre site et nos services, vous acceptez les pratiques décrites
                  dans cette politique.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  2. Responsable du traitement
                </h2>
                <p className="text-body/80">
                  Le responsable du traitement des données est :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Cann&apos;Agri Expo</strong></li>
                  <li><strong>Adresse :</strong> {siteConfig.event.location}</li>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  3. Données collectées
                </h2>
                <p className="text-body/80">
                  Nous collectons les données suivantes :
                </p>
                <h3 className="text-xl font-heading font-semibold text-heading mt-4 mb-2">
                  3.1 Données d&apos;identification
                </h3>
                <ul className="text-body/80 space-y-1 list-disc pl-6">
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Nom de l&apos;entreprise</li>
                  <li>Numéro SIRET (pour les professionnels)</li>
                </ul>

                <h3 className="text-xl font-heading font-semibold text-heading mt-4 mb-2">
                  3.2 Données de connexion
                </h3>
                <ul className="text-body/80 space-y-1 list-disc pl-6">
                  <li>Adresse IP (anonymisée)</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées</li>
                  <li>Date et heure de connexion</li>
                </ul>

                <h3 className="text-xl font-heading font-semibold text-heading mt-4 mb-2">
                  3.3 Données de transaction
                </h3>
                <ul className="text-body/80 space-y-1 list-disc pl-6">
                  <li>Historique des achats (billets, stands)</li>
                  <li>Informations de paiement (traitées par Stripe, non stockées chez nous)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  4. Finalités du traitement
                </h2>
                <p className="text-body/80">
                  Vos données sont collectées pour les finalités suivantes :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Gestion des inscriptions :</strong> Création et gestion de votre compte utilisateur</li>
                  <li><strong>Vente de billets et stands :</strong> Traitement de vos commandes et envoi des confirmations</li>
                  <li><strong>Communication :</strong> Envoi d&apos;informations sur l&apos;événement (si consentement)</li>
                  <li><strong>Newsletter :</strong> Envoi de notre newsletter (si inscription)</li>
                  <li><strong>Amélioration des services :</strong> Analyse statistique anonymisée pour améliorer notre site</li>
                  <li><strong>Obligations légales :</strong> Conservation des données de facturation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  5. Base légale du traitement
                </h2>
                <p className="text-body/80">
                  Le traitement de vos données repose sur les bases légales suivantes :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Consentement :</strong> Pour l&apos;inscription à la newsletter et les communications marketing</li>
                  <li><strong>Exécution d&apos;un contrat :</strong> Pour la vente de billets et de stands</li>
                  <li><strong>Intérêt légitime :</strong> Pour l&apos;amélioration de nos services</li>
                  <li><strong>Obligation légale :</strong> Pour la conservation des données de facturation</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  6. Durée de conservation
                </h2>
                <p className="text-body/80">
                  Nous conservons vos données pendant les durées suivantes :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Données de compte :</strong> Jusqu&apos;à la suppression de votre compte + 3 ans</li>
                  <li><strong>Données de transaction :</strong> 10 ans (obligation comptable)</li>
                  <li><strong>Données de newsletter :</strong> Jusqu&apos;au désabonnement</li>
                  <li><strong>Données de connexion :</strong> 1 an maximum</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  7. Destinataires des données
                </h2>
                <p className="text-body/80">
                  Vos données peuvent être partagées avec :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Stripe :</strong> Pour le traitement sécurisé des paiements</li>
                  <li><strong>Prestataires techniques :</strong> Hébergement et maintenance du site</li>
                  <li><strong>Autorités compétentes :</strong> En cas d&apos;obligation légale</li>
                </ul>
                <p className="text-body/80 mt-4">
                  <strong>Vos données ne sont jamais vendues à des tiers.</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  8. Transferts internationaux
                </h2>
                <p className="text-body/80">
                  Certains de nos prestataires (comme Stripe) peuvent traiter vos données en dehors
                  de l&apos;Union européenne. Dans ce cas, nous nous assurons que des garanties appropriées
                  sont en place (clauses contractuelles types, certification Privacy Shield, etc.).
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  9. Sécurité des données
                </h2>
                <p className="text-body/80">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                  pour protéger vos données :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li>Chiffrement des données sensibles</li>
                  <li>Connexions sécurisées (HTTPS)</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Mots de passe hashés avec bcrypt</li>
                  <li>Authentification à deux facteurs disponible</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  10. Vos droits
                </h2>
                <p className="text-body/80">
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Droit d&apos;accès :</strong> Obtenir une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                  <li><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données</li>
                  <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
                </ul>
                <p className="text-body/80 mt-4">
                  Pour exercer ces droits, contactez-nous à : <strong>{siteConfig.contact.email}</strong>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  11. Cookies
                </h2>
                <p className="text-body/80">
                  Notre site utilise des cookies pour :
                </p>
                <ul className="text-body/80 space-y-2 list-disc pl-6">
                  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (session, authentification)</li>
                  <li><strong>Cookies analytiques :</strong> Pour comprendre comment vous utilisez notre site (anonymisés)</li>
                </ul>
                <p className="text-body/80 mt-4">
                  Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  12. Réclamation
                </h2>
                <p className="text-body/80">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire
                  une réclamation auprès de la CNIL :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Site :</strong> www.cnil.fr</li>
                  <li><strong>Adresse :</strong> 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  13. Modifications
                </h2>
                <p className="text-body/80">
                  Nous nous réservons le droit de modifier cette politique de confidentialité.
                  Les modifications prendront effet dès leur publication sur le site.
                  Nous vous encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  14. Contact
                </h2>
                <p className="text-body/80">
                  Pour toute question concernant cette politique ou vos données personnelles :
                </p>
                <ul className="text-body/80 space-y-2">
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                  <li><strong>Délégué à la Protection des Données (DPO) :</strong> {siteConfig.contact.email}</li>
                </ul>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
