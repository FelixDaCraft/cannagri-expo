# Cann'Agri Expo 2026

Plateforme web complète de gestion d'événements pour le salon professionnel Cann'Agri Expo - le rendez-vous des professionnels du chanvre CBD en France.

**Date de l'événement:** 28 Mars 2026
**Lieu:** L'Agronaute, Nantes

---

## Aperçu

Cann'Agri Expo est une application web Next.js 14 permettant de gérer tous les aspects d'un salon professionnel :
- Billetterie en ligne avec génération de QR codes
- Réservation de stands exposants
- Gestion des sponsors et partenaires
- Programme des conférences
- Espace administration complet

---

## Stack Technique

### Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js** | 14.0.4 | Framework React avec App Router |
| **React** | 18 | Bibliothèque UI |
| **TypeScript** | 5 | Typage statique |
| **Tailwind CSS** | 3.3.0 | Framework CSS utility-first |
| **Motion** | 12.23.25 | Animations (Framer Motion) |
| **Aceternity UI** | - | Composants UI avancés |

### Backend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Next.js API Routes** | 14.0.4 | API serverless |
| **Prisma** | 5.22.0 | ORM TypeScript |
| **PostgreSQL** | 15+ | Base de données |
| **NextAuth.js** | 4.24.5 | Authentification |

### Paiement

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Viva Wallet** | - | Paiement (OAuth2) |

### Services

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Nodemailer** | 6.9.7 | Envoi d'emails SMTP |
| **bcryptjs** | 2.4.3 | Hashage des mots de passe |
| **qrcode** | 1.5.3 | Génération QR codes |
| **html5-qrcode** | 2.3.8 | Scan QR codes (contrôle billets) |
| **pdf-lib** | 1.17.1 | Génération de PDF |
| **next-intl** | 4.6.1 | Internationalisation (FR/EN) |
| **yet-another-react-lightbox** | 3.26.0 | Galerie photo lightbox |

### Tests

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Jest** | 30.2.0 | Framework de tests |
| **Testing Library** | 16.3.1 | Tests React |
| **ts-jest** | 29.4.6 | Support TypeScript |

### DevOps & Déploiement

| Technologie | Description |
|-------------|-------------|
| **Docker** | Conteneurisation multi-stage |
| **Docker Compose** | Orchestration des services |
| **Nginx** | Reverse proxy |
| **Node.js 20 Alpine** | Image de production |

---

## Architecture du Projet

```
cannagri-expo/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Routes admin protégées
│   │   └── admin/
│   │       ├── billetterie/      # Gestion billetterie
│   │       ├── infos-pratiques/  # Gestion contenus
│   │       ├── mediatheque/      # Gestion médias
│   │       ├── programme/        # Gestion événements/conférences
│   │       ├── pros/             # Gestion utilisateurs pro
│   │       ├── sponsor-requests/ # Demandes de sponsoring
│   │       ├── sponsors/         # Gestion sponsors
│   │       ├── stands/           # Gestion des stands
│   │       └── utilisateurs/     # Gestion utilisateurs
│   │
│   ├── (pro)/                    # Routes professionnels
│   │   └── pro/
│   │       └── plan/             # Plan interactif réservation stands
│   │
│   ├── (public)/                 # Routes publiques
│   │   ├── billetterie/          # Achat de billets
│   │   ├── cgv/                  # Conditions générales
│   │   ├── compte/               # Espace compte utilisateur
│   │   ├── confidentialite/      # Politique confidentialité
│   │   ├── connexion/            # Page de connexion
│   │   ├── contact/              # Formulaire de contact
│   │   ├── controle/             # Scan QR codes billets
│   │   ├── evenement/            # Notre Vision
│   │   ├── exposants/            # Liste des exposants
│   │   ├── infos-pratiques/      # Informations pratiques
│   │   ├── inscription/          # Inscription
│   │   ├── mediatheque/          # Galerie photos
│   │   ├── mentions-legales/     # Mentions légales
│   │   ├── programme/            # Programme événement
│   │   ├── sponsoring/           # Offres de sponsoring
│   │   └── sponsors/             # Pages sponsors
│   │
│   ├── api/                      # Routes API
│   │   ├── account/              # API compte utilisateur
│   │   ├── admin/                # APIs admin (CRUD)
│   │   ├── analytics/            # Tracking visiteurs
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── contact/              # Formulaire contact
│   │   ├── events/               # API événements publics
│   │   ├── exposants/            # API exposants publics
│   │   ├── payment/              # Webhooks paiement
│   │   ├── sponsor-request/      # Demandes sponsoring
│   │   ├── sponsors/             # API sponsors publics
│   │   ├── stands/               # API stands
│   │   ├── tickets/              # API billetterie
│   │   └── upload/               # Upload fichiers
│   │
│   ├── globals.css               # Styles globaux Tailwind
│   └── layout.tsx                # Layout racine
│
├── components/                   # Composants React
│   ├── admin/                    # Composants admin
│   ├── analytics/                # Analytics
│   ├── home/                     # Sections page d'accueil
│   ├── layout/                   # Header, Footer, etc.
│   ├── stands/                   # Composants stands
│   ├── tickets/                  # Composants billetterie
│   └── ui/                       # Bibliothèque UI
│
├── config/                       # Configuration
│   └── site.ts                   # Métadonnées site & navigation
│
├── lib/                          # Utilitaires & services
│   ├── auth.ts                   # Configuration NextAuth
│   ├── email.ts                  # Service email Nodemailer
│   ├── pdf.ts                    # Génération PDF billets
│   ├── prisma.ts                 # Client Prisma singleton
│   ├── qrcode.ts                 # Génération QR codes
│   ├── vivawallet.ts             # Intégration Viva Wallet
│   └── utils.ts                  # Fonctions utilitaires
│
├── prisma/                       # Base de données
│   ├── schema.prisma             # Schéma de données
│   └── seed.ts                   # Données initiales
│
├── public/                       # Fichiers statiques
│   └── images/                   # Images
│
├── types/                        # Types TypeScript
│   ├── index.ts                  # Types principaux
│   └── next-auth.d.ts            # Extension types auth
│
├── __tests__/                    # Tests unitaires & intégration
│   ├── components/               # Tests composants UI
│   └── lib/                      # Tests utilitaires
│
├── nginx/                        # Configuration Nginx
├── scripts/                      # Scripts déploiement
│
├── Dockerfile                    # Image Docker
├── docker-compose.yml            # Dev compose
├── docker-compose.prod.yml       # Prod compose
├── docker-compose.db.yml         # DB only compose
└── package.json                  # Dépendances
```

---

## Fonctionnalités

### Billetterie

| Type de Billet | Prix | Description |
|----------------|------|-------------|
| **Billet Standard** | 15€ | Accès au salon toute la journée |
| **Billet Flex** | 25€ | Soutien à l'association pour de futurs événements |

- Génération de QR codes uniques
- Génération de billets PDF
- Intégration paiement Viva Wallet
- E-billet envoyé par email
- Contrôle des billets par scan QR

### Gestion des Stands

| Caractéristique | Valeur |
|-----------------|--------|
| **Nombre de stands** | 25 |
| **Surface** | 4 m² |
| **Prix** | 150€ (net) |
| **Services inclus** | Mobilier (tables & chaises), Électricité |

- Visualisation SVG interactive du plan
- Système de réservation en temps réel
- Badge exposant inclus
- Mention sur le site web

### Sponsoring

4 niveaux de partenariat :
- **Platine** - Visibilité maximale
- **Or** - Visibilité premium
- **Argent** - Visibilité standard
- **Bronze** - Visibilité de base

Chaque niveau inclut :
- Logo sur le site
- Publications sur les réseaux sociaux
- Stories Instagram
- Stand exposant offert (selon niveau)

### Programme

- Gestion des conférences et événements
- Intervenants multiples par événement
- Types : Conférence, Atelier, Cérémonie, Networking
- Statistiques dynamiques sur l'accueil

### Authentification

- Email / Mot de passe
- Rôles : Admin, Pro, Visiteur
- Système d'approbation pour les comptes Pro
- Espace compte utilisateur

### Administration

- Dashboard avec statistiques en temps réel
- Gestion complète : stands, exposants, sponsors, billets
- Gestion du programme et des événements
- Analytics de fréquentation

---

## Navigation du Site

```
├── Notre Vision          → /evenement
├── L'Événement (menu)
│   ├── Programme         → /programme
│   ├── Exposants         → /exposants
│   ├── Galerie Photo     → /mediatheque
│   └── Infos Pratiques   → /infos-pratiques
├── Sponsoring            → /sponsoring
└── Espace Pro (menu)     → (visible si connecté et approuvé)
    ├── Devenir Exposant  → /pro
    └── Réserver un Stand → /pro/plan
```

---

## Installation

### Prérequis

- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone https://github.com/FelixDaCraft/cannagri-expo.git
cd cannagri-expo

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
npm run db:push
npm run db:seed

# Lancer le serveur de développement
npm run dev
```

### Installation Docker

```bash
# Base de données seule
docker-compose -f docker-compose.db.yml up -d

# Développement complet
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement (http://localhost:3000) |
| `npm run build` | Build de production (lance les tests avant) |
| `npm start` | Démarrer en production |
| `npm run lint` | Lancer ESLint |
| `npm test` | Lancer les tests Jest |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec couverture |
| `npm run db:push` | Synchroniser schéma Prisma |
| `npm run db:seed` | Peupler la base de données |
| `npm run db:studio` | Ouvrir Prisma Studio |

---

## Variables d'Environnement

Créer un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/cannagri"

# NextAuth
NEXTAUTH_SECRET="votre-secret-genere"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Paiement Viva Wallet
VIVA_WALLET_CLIENT_ID=""
VIVA_WALLET_CLIENT_SECRET=""
VIVA_WALLET_MERCHANT_ID=""
VIVA_WALLET_SOURCE_CODE=""

# Email SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="noreply@cannagri-expo.fr"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Design System

### Palette de Couleurs

| Nom | Hex | CSS Variable | Usage |
|-----|-----|--------------|-------|
| **Forest** | `#3D5A45` | `--forest` | Couleur principale, titres |
| **Sage/Mint** | `#A4B494` | `--sage` | Couleur secondaire |
| **Cream** | `#F4F1E8` | `--cream` | Fond clair |
| **Terracotta** | `#C4784A` | `--terracotta` | Accent, CTAs |
| **Wood** | `#8B7355` | `--wood` | Tons bois |

### Typographie

- **Titres:** Roboto Slab (serif)
- **Corps:** Open Sans (sans-serif)

### Composants UI

Le projet utilise une bibliothèque de composants custom basée sur Tailwind CSS :
- `Button` - Boutons avec variantes (primary, secondary, outline, ghost)
- `Card` - Cartes avec variantes (default, bordered, elevated)
- `Badge` - Badges de statut
- `Input` - Champs de formulaire
- `Modal` - Modales
- Composants Aceternity UI pour les effets visuels avancés

---

## API Endpoints

### Publics

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/events` | Liste des événements |
| GET | `/api/sponsors` | Liste des sponsors |
| GET | `/api/exposants` | Liste des exposants |
| GET | `/api/stands` | Liste des stands |
| POST | `/api/contact` | Formulaire de contact |
| POST | `/api/sponsor-request` | Demande de sponsoring |
| POST | `/api/payment/checkout` | Initier un paiement |

### Admin (authentifié)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/api/admin/events` | CRUD événements |
| GET/POST | `/api/admin/sponsors` | CRUD sponsors |
| GET/POST | `/api/admin/stands` | CRUD stands |
| GET/POST | `/api/admin/users` | CRUD utilisateurs |
| GET/POST | `/api/admin/pros` | Gestion comptes pro |

---

## Déploiement

### Production avec Docker

```bash
# Build et démarrage
docker-compose -f docker-compose.prod.yml up -d --build

# Logs
docker-compose -f docker-compose.prod.yml logs -f

# Arrêt
docker-compose -f docker-compose.prod.yml down
```

### Variables de production

Assurez-vous de configurer :
- `NEXTAUTH_URL` avec l'URL de production
- `DATABASE_URL` avec la connexion PostgreSQL de production
- Les clés API de paiement en mode production
- Un `NEXTAUTH_SECRET` sécurisé

---

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'feat: Ajouter nouvelle fonctionnalité'`)
4. Push la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

---

## Licence

Projet propriétaire - Tous droits réservés

---

## Contact

- **Email:** hello@cannagri-expo.fr
- **Site:** https://cannagri-expo.fr

Pour toute question technique concernant le projet, ouvrez une issue sur GitHub.
