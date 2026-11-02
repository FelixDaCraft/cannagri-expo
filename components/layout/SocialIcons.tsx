import { siteConfig } from '@/config/site'

// Pictogrammes en SVG inline (aucune ressource externe), tracés simplifiés des logos officiels
const ICONS: Record<string, React.ReactNode> = {
  instagram: (
    <path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.3.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 100 12.8 6.4 6.4 0 000-12.8zm0 10.6a4.2 4.2 0 110-8.4 4.2 4.2 0 010 8.4zm6.6-12.3a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  ),
  facebook: (
    <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.62 23.1 24 18.1 24 12.07z" />
  ),
  linkedin: (
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  ),
}

const NETWORKS = [
  { key: 'instagram', label: 'Instagram', href: siteConfig.social.instagram },
  { key: 'facebook', label: 'Facebook', href: siteConfig.social.facebook },
  { key: 'linkedin', label: 'LinkedIn', href: siteConfig.social.linkedin },
] as const

/** Liens vers les réseaux sociaux : icônes de 44 px, nom accessible complet (« Instagram de Cann'Agri Expo ») */
export function SocialIcons({ labelTemplate }: { labelTemplate: (network: string) => string }) {
  return (
    <ul className="flex gap-2">
      {NETWORKS.filter((n) => n.href).map((network) => (
        <li key={network.key}>
          <a
            href={network.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={labelTemplate(network.label)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-cream/25 text-cream/85 transition-colors hover:border-mint hover:text-mint"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              {ICONS[network.key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  )
}
