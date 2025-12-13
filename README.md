# Cann'Agri Expo 2026

Plateforme web complète de gestion d'événements pour le salon professionnel Cann'Agri Expo - le rendez-vous des professionnels du chanvre CBD en France.

**Date de l'événement:** 28 Mars 2026
**Lieu:** L'Agronaute, Nantes

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
| **PostgreSQL** | 15 | Base de données |
| **NextAuth.js** | 4.24.5 | Authentification |

### Paiement

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Viva Wallet** | - | Paiement principal (OAuth2) |
| **Stripe** | 14.14.0 | Paiement secondaire |

### Services

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Nodemailer** | 6.9.7 | Envoi d'emails SMTP |
| **bcryptjs** | 2.4.3 | Hashage des mots de passe |
| **qrcode** | 1.5.3 | Génération QR codes |
| **pdf-lib** | 1.17.1 | Génération de PDF |

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
cannagri/
├── app/                          # Next.js App Router
│   ├── (admin)/                  # Routes admin protégées
│   │   ├── admin/
│   │   │   ├── billetterie/      # Gestion billetterie
│   │   │   ├── exposants/        # Gestion exposants
│   │   │   ├── infos-pratiques/  # Gestion contenus
│   │   │   ├── mediatheque/      # Gestion médias
│   │   │   ├── pros/             # Gestion utilisateurs pro
│   │   │   ├── sponsor-requests/ # Demandes de sponsoring
│   │   │   ├── sponsors/         # Gestion sponsors
│   │   │   ├── stands/           # Gestion des stands
│   │   │   └── utilisateurs/     # Gestion utilisateurs
│   │   └── layout.tsx
│   │
│   ├── (pro)/                    # Routes professionnels
│   │   └── pro/
│   │       ├── plan/             # Plan interactif des stands
│   │       └── sponsoring/       # Informations sponsoring
│   │
│   ├── (public)/                 # Routes publiques
│   │   ├── billetterie/          # Achat de billets
│   │   ├── cgv/                  # Conditions générales
│   │   ├── confidentialite/      # Politique confidentialité
│   │   ├── connexion/            # Page de connexion
│   │   ├── contact/              # Formulaire de contact
│   │   ├── evenement/            # Détails événement
│   │   ├── exposants/            # Liste des exposants
│   │   ├── infos-pratiques/      # Informations pratiques
│   │   ├── inscription/          # Inscription
│   │   ├── mediatheque/          # Galerie photos
│   │   ├── mentions-legales/     # Mentions légales
│   │   ├── programme/            # Programme événement
│   │   └── sponsors/             # Liste des sponsors
│   │
│   ├── api/                      # Routes API
│   │   ├── admin/                # APIs admin (CRUD)
│   │   ├── analytics/            # Tracking visiteurs
│   │   ├── auth/                 # NextAuth endpoints
│   │   ├── contact/              # Formulaire contact
│   │   ├── payment/              # Webhooks paiement
│   │   ├── sponsor-request/      # Demandes sponsoring
│   │   ├── stands/               # API stands
│   │   └── tickets/              # API billetterie
│   │
│   ├── globals.css               # Styles globaux Tailwind
│   └── layout.tsx                # Layout racine
│
├── components/                   # Composants React
│   ├── admin/                    # Composants admin
│   │   ├── DataTable.tsx         # Table de données générique
│   │   ├── SponsorForm.tsx       # Formulaire sponsor
│   │   ├── StatsCards.tsx        # Cartes statistiques
│   │   └── VisitorStats.tsx      # Statistiques visiteurs
│   │
│   ├── analytics/                # Analytics
│   │   └── PageTracker.tsx       # Tracking pages vues
│   │
│   ├── home/                     # Sections page d'accueil
│   │   ├── HeroSection.tsx       # Hero avec countdown
│   │   ├── CountdownTimer.tsx    # Compte à rebours
│   │   ├── TicketSection.tsx     # Section billetterie
│   │   ├── PillarsSection.tsx    # 4 piliers de l'événement
│   │   ├── SponsorsArticles.tsx  # Articles sponsors premium
│   │   ├── ProgramHighlight.tsx  # Programme en avant
│   │   └── PartnersGrid.tsx      # Grille partenaires
│   │
│   ├── layout/                   # Layout
│   │   ├── Header.tsx            # En-tête navigation
│   │   ├── Footer.tsx            # Pied de page
│   │   └── InfoBanner.tsx        # Bannière info
│   │
│   ├── stands/                   # Composants stands
│   │   ├── InteractiveStandPlan.tsx      # Plan SVG interactif
│   │   ├── AdminInteractiveStandPlan.tsx # Plan admin
│   │   ├── StandPlan.tsx         # Plan statique
│   │   ├── StandCard.tsx         # Carte stand
│   │   └── StandBookingModal.tsx # Modal réservation
│   │
│   ├── tickets/                  # Composants billetterie
│   │   ├── TicketForm.tsx        # Formulaire achat
│   │   └── TicketConfirmation.tsx# Confirmation commande
│   │
│   └── ui/                       # Bibliothèque UI
│       ├── badge.tsx             # Badges
│       ├── button.tsx            # Boutons
│       ├── card.tsx              # Cartes
│       ├── input.tsx             # Champs de saisie
│       ├── modal.tsx             # Modales
│       ├── bento-grid.tsx        # Grille Bento
│       ├── floating-particles.tsx# Particules animées
│       ├── moving-border.tsx     # Bordure animée
│       ├── spotlight.tsx         # Effet spotlight
│       ├── text-generate-effect.tsx # Animation texte
│       └── wavy-background.tsx   # Fond ondulé
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
│   ├── stripe.ts                 # Intégration Stripe
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
├── nginx/                        # Configuration Nginx
├── scripts/                      # Scripts déploiement
│
├── Dockerfile                    # Image Docker
├── docker-compose.yml            # Dev compose
├── docker-compose.prod.yml       # Prod compose
├── tailwind.config.ts            # Config Tailwind
├── tsconfig.json                 # Config TypeScript
├── next.config.js                # Config Next.js
├── .env.example                  # Template variables env
└── package.json                  # Dépendances
```

---

## Schéma Base de Données

### Entités Principales

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      User       │     │     Sponsor     │     │      Stand      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ email           │     │ name            │     │ number (1-25)   │
│ password        │     │ tier (PLATINUM, │     │ status (FREE,   │
│ role (ADMIN,    │     │   GOLD, SILVER, │     │   RESERVED,     │
│   EDITOR, PRO)  │     │   BRONZE)       │     │   SOLD)         │
│ firstName       │     │ logo            │     │ size (S, M, L)  │
│ lastName        │     │ website         │     │ price           │
│ company         │     │ description     │     │ svgPosition     │
│ isVerified      │     │ featured        │     │ exhibitorId     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Order       │     │     Ticket      │     │    Exhibitor    │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ userId          │     │ orderId         │     │ companyName     │
│ total           │     │ type (VISITEUR, │     │ category        │
│ tax (20% TVA)   │     │   PASS_PRO,VIP) │     │ description     │
│ status          │     │ status          │     │ logo            │
│ stripeId        │     │ qrCode          │     │ contact         │
│ vivaOrderCode   │     │ holderName      │     │ sponsorId       │
└─────────────────┘     │ holderEmail     │     └─────────────────┘
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Event      │     │      Media      │     │  SiteSettings   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ title           │     │ url             │     │ ticketSaleStart │
│ description     │     │ thumbnail       │     │ ticketSaleEnd   │
│ date            │     │ caption         │     │ visitorPrice    │
│ startTime       │     │ category        │     │ proPrice        │
│ endTime         │     │ edition         │     │ vipPrice        │
│ speaker         │     │ order           │     │ eventDate       │
│ category        │     └─────────────────┘     │ eventLocation   │
└─────────────────┘                             └─────────────────┘
```

### Autres Entités
- **Account** / **Session** / **VerificationToken** : Gestion NextAuth
- **ContactRequest** : Formulaire de contact
- **SponsorRequest** : Demandes de sponsoring
- **NewsletterSubscriber** : Abonnés newsletter
- **PageView** / **DailyStats** : Analytics

---

## Fonctionnalités

### Billetterie
- 3 types de billets : Visiteur (15€), Pass Pro (25€), VIP (75€)
- Génération de QR codes uniques
- Génération de billets PDF
- Intégration paiement Viva Wallet / Stripe

### Gestion des Stands
- 25 stands avec visualisation SVG interactive
- Système de réservation temporaire (15 min)
- 3 tailles : Small (6-9m²), Medium (12-18m²), Large (24+m²)
- Options mobilier et électricité

### Sponsoring
- 4 niveaux : Platinum, Gold, Silver, Bronze
- Pages dédiées par sponsor
- Articles sponsors premium en page d'accueil

### Authentification
- Email/Mot de passe
- OAuth 2.0 : Google, Apple
- Rôles : Admin, Editor, Pro

### Administration
- Dashboard avec statistiques
- Gestion complète : stands, exposants, sponsors, billets
- Analytics de fréquentation

---

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 15+
- npm ou yarn

### Installation locale

```bash
# Cloner le repository
git clone <repository-url>
cd cannagri

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
# Développement
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

---

## Scripts NPM

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm start` | Démarrer en production |
| `npm run lint` | Lancer ESLint |
| `npm run db:push` | Synchroniser schéma Prisma |
| `npm run db:seed` | Peupler la base de données |
| `npm run db:studio` | Ouvrir Prisma Studio |

---

## Variables d'Environnement

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/cannagri"

# NextAuth
NEXTAUTH_SECRET="votre-secret"
NEXTAUTH_URL="http://localhost:3000"

# OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

# Paiement
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
VIVA_WALLET_CLIENT_ID=""
VIVA_WALLET_CLIENT_SECRET=""
VIVA_WALLET_MERCHANT_ID=""

# Email
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM=""
```

---

## Design System

### Palette de Couleurs (Affiche 2026)

| Nom | Hex | Usage |
|-----|-----|-------|
| **Mint/Sage** | `#8FB58B` | Couleur primaire |
| **Forest** | `#3D5A45` | Vert foncé, titres |
| **Cream** | `#F4F1E8` | Fond clair |
| **Terracotta** | `#C4784A` | Accent chaud |
| **Wood** | `#8B7355` | Tons bois |

### Typographie

- **Titres:** Roboto Slab (serif)
- **Corps:** Open Sans (sans-serif)

---

## Licence

Projet propriétaire - Tous droits réservés

---

## Contact

Pour toute question concernant le projet, contactez l'équipe de développement.
