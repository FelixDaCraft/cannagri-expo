import { NavItem } from '@/types'

export const siteConfig = {
  name: "Cann'Agri Expo",
  description: "Le salon de référence des professionnels du chanvre CBD en France",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://cannagri-expo.fr",

  // Event info
  event: {
    date: "28 Mars 2026",
    dateISO: "2026-03-28",
    location: "L'Agronaute",
    city: "Nantes",
    address: "L'Agronaute, Nantes, France",
    year: "2026",
  },

  // Contact
  contact: {
    email: "hello@cannagri-expo.fr",
    phone: "+33 2 XX XX XX XX",
  },

  // Social links
  social: {
    facebook: "https://facebook.com/cannagriexpo",
    instagram: "https://instagram.com/cannagriexpo",
    linkedin: "https://linkedin.com/company/cannagriexpo",
  },

  // SEO
  seo: {
    title: "Cann'Agri Expo 2026 | Salon Professionnel du Chanvre CBD",
    description: "Le rendez-vous incontournable des professionnels du chanvre CBD. 28 mars 2026 - L'Agronaute, Nantes. Exposants, conférences, Platinum CBD Cup.",
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

  // Ticket prices (in EUR)
  tickets: {
    visiteur: {
      name: "Visiteur",
      price: 15,
      description: "Accès au salon toute la journée",
    },
    pro: {
      name: "Pass Pro",
      price: 25,
      description: "Accès privilégié + badge professionnel",
    },
    vip: {
      name: "VIP",
      price: 75,
      description: "Accès VIP + cocktail networking + goodies",
    },
  },
}

export const navigation: NavItem[] = [
  { label: "Accueil", href: "/" },
  {
    label: "L'Événement",
    href: "#",
    children: [
      { label: "Présentation", href: "/evenement" },
      { label: "Infos Pratiques", href: "/infos-pratiques" },
    ],
  },
  { label: "Programme", href: "/programme" },
  { label: "Exposants", href: "/exposants" },
  { label: "Galerie Photo", href: "/mediatheque" },
  {
    label: "Espace Pro",
    href: "/pro",
    children: [
      { label: "Devenir Exposant", href: "/pro" },
      { label: "Plan des Stands", href: "/pro/plan" },
      { label: "Sponsoring", href: "/pro/sponsoring" },
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
