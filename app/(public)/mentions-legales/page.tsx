import type { Metadata } from 'next'
import { siteConfig } from '@/config/site'
import { LegalPage } from '@/components/legal/LegalPage'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales du site Cann\'Agri Expo',
}

const TOC = [
  { id: 'editeur-du-site', label: '1. Éditeur du site' },
  { id: 'hebergement', label: '2. Hébergement' },
  { id: 'propriete-intellectuelle', label: '3. Propriété intellectuelle' },
  { id: 'limitation-de-responsabilite', label: '4. Limitation de responsabilité' },
  { id: 'liens-hypertextes', label: '5. Liens hypertextes' },
  { id: 'droit-applicable', label: '6. Droit applicable' },
  { id: 'contact', label: '7. Contact' },
]

export default function MentionsLegalesPage() {
  return (
    <LegalPage title="Mentions légales" updated="Dernière mise à jour : décembre 2025" toc={TOC}>
            <h2 id="editeur-du-site">1. Éditeur du site</h2>
                <p>
                  Le site <strong>Cann&apos;Agri Expo</strong> ({siteConfig.url}) est édité par :
                </p>
                <ul>
                  <li><strong>Raison sociale :</strong> PLATINUM CBD</li>
                  <li><strong>Forme juridique :</strong> Association déclarée (loi 1901)</li>
                  <li><strong>N° RNA :</strong> W442 027 639</li>
                  <li><strong>Siège social :</strong> 9 rue de Beaulieu, 44340 Bouguenais, France</li>
                  <li><strong>SIRET :</strong> 921 098 497 00016</li>
                  <li><strong>Code NAF/APE :</strong> 94.99Z - Autres organisations fonctionnant par adhésion volontaire</li>
                  <li><strong>Date de création :</strong> 26 octobre 2022</li>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                  <li><strong>Objet :</strong> Mise en avant du savoir-faire européen des producteurs de chanvre au travers de divers événements</li>
                </ul>
              

              
                <h2 id="hebergement">2. Hébergement</h2>
                <p>
                  Le site est hébergé par :
                </p>
                <ul>
                  <li><strong>Hébergeur :</strong> Vercel Inc.</li>
                  <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
                  <li><strong>Site web :</strong> https://vercel.com</li>
                </ul>
              

              
                <h2 id="propriete-intellectuelle">3. Propriété intellectuelle</h2>
                <p>
                  L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes, etc.)
                  est la propriété exclusive de Cann&apos;Agri Expo ou de ses partenaires et est protégé
                  par les lois françaises et internationales relatives à la propriété intellectuelle.
                </p>
                <p>
                  Toute reproduction, représentation, modification, publication, transmission ou
                  dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé
                  que ce soit, et sur quelque support que ce soit est interdite sans l&apos;autorisation
                  écrite préalable de Cann&apos;Agri Expo.
                </p>
              

              
                <h2 id="limitation-de-responsabilite">4. Limitation de responsabilité</h2>
                <p>
                  Les informations contenues sur ce site sont aussi précises que possible et le site
                  est périodiquement remis à jour, mais peut toutefois contenir des inexactitudes,
                  des omissions ou des lacunes.
                </p>
                <p>
                  Cann&apos;Agri Expo ne pourra être tenue responsable des dommages directs et indirects
                  causés au matériel de l&apos;utilisateur lors de l&apos;accès au site, résultant soit de
                  l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications techniques requises,
                  soit de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              

              
                <h2 id="liens-hypertextes">5. Liens hypertextes</h2>
                <p>
                  Le site peut contenir des liens hypertextes vers d&apos;autres sites internet.
                  Cann&apos;Agri Expo n&apos;exerce aucun contrôle sur ces sites et décline toute
                  responsabilité quant à leur contenu.
                </p>
              

              
                <h2 id="droit-applicable">6. Droit applicable</h2>
                <p>
                  Les présentes mentions légales sont régies par le droit français.
                  En cas de litige, les tribunaux de Nantes seront seuls compétents.
                </p>
              

              
                <h2 id="contact">7. Contact</h2>
                <p>
                  Pour toute question concernant ces mentions légales, vous pouvez nous contacter à :
                </p>
                <ul>
                  <li><strong>Email :</strong> {siteConfig.contact.email}</li>
                </ul>
    </LegalPage>
  )
}
