import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: 'Politique de confidentialité et protection des données personnelles - Cann\'Agri Expo',
}

const TOC = [
  { id: 'introduction', label: '1. Introduction' },
  { id: 'responsable-du-traitement', label: '2. Responsable du traitement' },
  { id: 'donnees-collectees', label: '3. Données collectées' },
  { id: 'finalites-du-traitement', label: '4. Finalités du traitement' },
  { id: 'base-legale-du-traitement', label: '5. Base légale du traitement' },
  { id: 'duree-de-conservation', label: '6. Durée de conservation' },
  { id: 'destinataires-des-donnees', label: '7. Destinataires des données' },
  { id: 'transferts-internationaux', label: '8. Transferts internationaux' },
  { id: 'securite-des-donnees', label: '9. Sécurité des données' },
  { id: 'vos-droits', label: '10. Vos droits' },
  { id: 'cookies', label: '11. Cookies' },
  { id: 'reclamation', label: '12. Réclamation' },
  { id: 'modifications', label: '13. Modifications' },
  { id: 'contact', label: '14. Contact' },
]

export default function ConfidentialitePage() {
  return (
    <LegalPage title="Politique de confidentialité" updated="Dernière mise à jour : décembre 2025" toc={TOC}>
            <h2 id="introduction">1. Introduction</h2>
                <p>
                  La présente politique de confidentialité définit la manière dont Cann&apos;Agri Expo
                  collecte, utilise, conserve et protège vos données personnelles conformément au
                  Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique
                  et Libertés.
                </p>
                <p>
                  En utilisant notre site et nos services, vous acceptez les pratiques décrites
                  dans cette politique.
                </p>
              

              
                <h2 id="responsable-du-traitement">2. Responsable du traitement</h2>
                <p>
                  Le responsable du traitement des données est :
                </p>
                <ul>
                  <li><strong>PLATINUM CBD</strong></li>
                  <li><strong>Forme juridique :</strong> Association déclarée (loi 1901)</li>
                  <li><strong>N° RNA :</strong> W442 027 639</li>
                  <li><strong>SIRET :</strong> 921 098 497 00016</li>
                  <li><strong>Adresse :</strong> 9 rue de Beaulieu, 44340 Bouguenais, France</li>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                </ul>
              

              
                <h2 id="donnees-collectees">3. Données collectées</h2>
                <p>
                  Nous collectons les données suivantes :
                </p>
                <h3>
                  3.1 Données d&apos;identification
                </h3>
                <ul>
                  <li>Nom et prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Nom de l&apos;entreprise</li>
                  <li>Numéro SIRET (pour les professionnels)</li>
                </ul>

                <h3>
                  3.2 Données de connexion
                </h3>
                <ul>
                  <li>Adresse IP (anonymisée)</li>
                  <li>Type de navigateur</li>
                  <li>Pages visitées</li>
                  <li>Date et heure de connexion</li>
                </ul>

                <h3>
                  3.3 Données de transaction
                </h3>
                <ul>
                  <li>Historique des achats (billets, stands)</li>
                  <li>Informations de paiement (traitées par Viva Wallet, non stockées chez nous)</li>
                </ul>
              

              
                <h2 id="finalites-du-traitement">4. Finalités du traitement</h2>
                <p>
                  Vos données sont collectées pour les finalités suivantes :
                </p>
                <ul>
                  <li><strong>Gestion des inscriptions :</strong> Création et gestion de votre compte utilisateur</li>
                  <li><strong>Vente de billets et stands :</strong> Traitement de vos commandes et envoi des confirmations</li>
                  <li><strong>Communication :</strong> Envoi d&apos;informations sur l&apos;événement (si consentement)</li>
                  <li><strong>Newsletter :</strong> Envoi de notre newsletter (si inscription)</li>
                  <li><strong>Amélioration des services :</strong> Analyse statistique anonymisée pour améliorer notre site</li>
                  <li><strong>Obligations légales :</strong> Conservation des données de facturation</li>
                </ul>
              

              
                <h2 id="base-legale-du-traitement">5. Base légale du traitement</h2>
                <p>
                  Le traitement de vos données repose sur les bases légales suivantes :
                </p>
                <ul>
                  <li><strong>Consentement :</strong> Pour l&apos;inscription à la newsletter et les communications marketing</li>
                  <li><strong>Exécution d&apos;un contrat :</strong> Pour la vente de billets et de stands</li>
                  <li><strong>Intérêt légitime :</strong> Pour l&apos;amélioration de nos services</li>
                  <li><strong>Obligation légale :</strong> Pour la conservation des données de facturation</li>
                </ul>
              

              
                <h2 id="duree-de-conservation">6. Durée de conservation</h2>
                <p>
                  Nous conservons vos données pendant les durées suivantes :
                </p>
                <ul>
                  <li><strong>Données de compte :</strong> Jusqu&apos;à la suppression de votre compte + 3 ans</li>
                  <li><strong>Données de transaction :</strong> 10 ans (obligation comptable)</li>
                  <li><strong>Données de newsletter :</strong> Jusqu&apos;au désabonnement</li>
                  <li><strong>Données de connexion :</strong> 1 an maximum</li>
                </ul>
              

              
                <h2 id="destinataires-des-donnees">7. Destinataires des données</h2>
                <p>
                  Vos données peuvent être partagées avec :
                </p>
                <ul>
                  <li><strong>Viva Wallet :</strong> Pour le traitement sécurisé des paiements</li>
                  <li><strong>Vercel :</strong> Hébergement du site</li>
                  <li><strong>Neon :</strong> Hébergement de la base de données</li>
                  <li><strong>Autorités compétentes :</strong> En cas d&apos;obligation légale</li>
                </ul>
                <p>
                  <strong>Vos données ne sont jamais vendues à des tiers.</strong>
                </p>
              

              
                <h2 id="transferts-internationaux">8. Transferts internationaux</h2>
                <p>
                  Certains de nos prestataires (comme Vercel) peuvent traiter vos données en dehors
                  de l&apos;Union européenne. Dans ce cas, nous nous assurons que des garanties appropriées
                  sont en place (clauses contractuelles types, décision d&apos;adéquation, etc.).
                </p>
              

              
                <h2 id="securite-des-donnees">9. Sécurité des données</h2>
                <p>
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées
                  pour protéger vos données :
                </p>
                <ul>
                  <li>Chiffrement des données sensibles</li>
                  <li>Connexions sécurisées (HTTPS)</li>
                  <li>Accès restreint aux données personnelles</li>
                  <li>Mots de passe hashés avec bcrypt</li>
                  <li>Authentification à deux facteurs disponible</li>
                </ul>
              

              
                <h2 id="vos-droits">10. Vos droits</h2>
                <p>
                  Conformément au RGPD, vous disposez des droits suivants :
                </p>
                <ul>
                  <li><strong>Droit d&apos;accès :</strong> Obtenir une copie de vos données personnelles</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos données inexactes</li>
                  <li><strong>Droit à l&apos;effacement :</strong> Demander la suppression de vos données</li>
                  <li><strong>Droit à la limitation :</strong> Limiter le traitement de vos données</li>
                  <li><strong>Droit à la portabilité :</strong> Recevoir vos données dans un format structuré</li>
                  <li><strong>Droit d&apos;opposition :</strong> Vous opposer au traitement de vos données</li>
                  <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement à tout moment</li>
                </ul>
                <p>
                  Pour exercer ces droits, contactez-nous à : <strong>{siteConfig.contact.email}</strong>
                </p>
              

              
                <h2 id="cookies">11. Cookies</h2>
                <p>
                  Notre site utilise des cookies pour :
                </p>
                <ul>
                  <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site (session, authentification)</li>
                  <li><strong>Cookies analytiques :</strong> Pour comprendre comment vous utilisez notre site (anonymisés)</li>
                </ul>
                <p>
                  Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                </p>
              

              
                <h2 id="reclamation">12. Réclamation</h2>
                <p>
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire
                  une réclamation auprès de la CNIL :
                </p>
                <ul>
                  <li><strong>Site :</strong> www.cnil.fr</li>
                  <li><strong>Adresse :</strong> 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
                </ul>
              

              
                <h2 id="modifications">13. Modifications</h2>
                <p>
                  Nous nous réservons le droit de modifier cette politique de confidentialité.
                  Les modifications prendront effet dès leur publication sur le site.
                  Nous vous encourageons à consulter régulièrement cette page.
                </p>
              

              
                <h2 id="contact">14. Contact</h2>
                <p>
                  Pour toute question concernant cette politique ou vos données personnelles :
                </p>
                <ul>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                  <li><strong>Délégué à la Protection des Données (DPO) :</strong> {siteConfig.contact.email}</li>
                </ul>
    </LegalPage>
  )
}
