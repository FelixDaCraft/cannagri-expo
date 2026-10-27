import { NavItem } from '@/types'

export const siteConfig = {
  name: "Cann'Agri Expo",
  description: "Le salon de référence des professionnels du chanvre CBD en France",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://cannagri-expo.fr",

  // Date, lieu, affiche et tarifs dépendent de l'édition : voir le modèle Edition
  // (administration > Éditions) et lib/editions.

  // Contact
  contact: {
    email: "hello@cannagri-expo.fr",
    phone: "+33 6 26 73 55 97",
  },

  // Social links
  social: {
    facebook: "https://facebook.com/cannagriexpo",
    instagram: "https://www.instagram.com/cannagri_expo",
    linkedin: "https://www.linkedin.com/company/cannagri-expo/",
  },

  // SEO
  seo: {
    title: "Cann'Agri Expo | Salon Professionnel du Chanvre CBD",
    description: "Le rendez-vous incontournable des professionnels du chanvre CBD en France. Exposants, conférences, Platinum CBD Cup.",
    keywords: [
      "CBD",
      "chanvre",
      "salon professionnel",
      "Nantes",
      "exposants",
      "conférence",
      "Platinum CBD Cup",
      "agriculture",
      "France",
    ],
  },

  // Formules de billets (prix : voir l'édition)
  tickets: {
    standard: {
      name: "Billet Standard",
      description: "Accès au salon toute la journée",
    },
    flex: {
      name: "Billet Flex",
      description: "Soutenez l'association et ses futurs événements",
    },
  },
}

export const navigation: NavItem[] = [
  { label: "Présentation", href: "/evenement" },
  {
    label: "L'Événement",
    href: "/programme",
    children: [
      { label: "Programme", href: "/programme" },
      { label: "Exposants", href: "/exposants" },
      { label: "Galerie Photo", href: "/mediatheque" },
      { label: "Infos Pratiques", href: "/infos-pratiques" },
    ],
  },
  { label: "Sponsoring", href: "/sponsoring" },
  { label: "Contact", href: "/contact" },
  {
    label: "Espace Pro",
    href: "/pro",
    children: [
      { label: "Devenir Exposant", href: "/pro" },
      { label: "Réserver un Stand", href: "/pro/plan" },
    ],
  },
]

export const footerLinks = {
  about: {
    title: "À Propos",
    content: "Cann'Agri Expo est le salon de référence des professionnels du chanvre CBD en France. Retrouvez producteurs, distributeurs et experts pour une journée d'échanges et de découvertes.",
  },
  navigation: {
    title: "Navigation",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Programme", href: "/programme" },
      { label: "Exposants", href: "/exposants" },
      { label: "Contact", href: "/contact" },
      { label: "Contact Presse", href: "/contact?type=press" },
    ],
  },
  legal: [
    { label: "Mentions Légales", href: "/mentions-legales" },
    { label: "Politique de Confidentialité", href: "/confidentialite" },
    { label: "CGV", href: "/cgv" },
  ],
}

export const pillars = [
  {
    title: "Producteurs CBD",
    description: "Rencontrez les cultivateurs et producteurs de chanvre CBD français et européens.",
    icon: "leaf",
    link: "/exposants?category=producteur",
  },
  {
    title: "Matériel de Culture",
    description: "Découvrez les dernières innovations en équipement et technologie de culture.",
    icon: "settings",
    link: "/exposants?category=materiel",
  },
  {
    title: "Conférences",
    description: "Assistez aux interventions d'experts sur la réglementation et les tendances du marché.",
    icon: "mic",
    link: "/programme",
  },
  {
    title: "Lifestyle & Food",
    description: "Explorez les produits CBD pour le bien-être et l'alimentation.",
    icon: "heart",
    link: "/exposants?category=lifestyle",
  },
]
