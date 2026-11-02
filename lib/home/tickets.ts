/** Nombre maximal de billets d'un même type choisis depuis l'accueil */
export const MAX_TICKETS_PER_TYPE = 10

export interface TicketQuantities {
  standard: number
  flex: number
}

export function clampTicketQuantity(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(MAX_TICKETS_PER_TYPE, Math.max(0, Math.floor(value)))
}

/**
 * Lien vers la billetterie avec le choix fait sur l'accueil.
 * Contrat convenu avec la billetterie : /billetterie?standard=<n>&flex=<n>
 */
export function buildTicketingHref({ standard, flex }: TicketQuantities): string {
  const s = clampTicketQuantity(standard)
  const f = clampTicketQuantity(flex)
  if (s === 0 && f === 0) return '/billetterie'
  return `/billetterie?standard=${s}&flex=${f}`
}
