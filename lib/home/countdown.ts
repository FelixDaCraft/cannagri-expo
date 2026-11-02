export interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  /** Le salon a commencé (ou est passé) */
  isOver: boolean
}

/** Temps restant avant l'ouverture, ou null si la date de l'édition n'est pas fixée */
export function getTimeLeft(startAt: string | Date | null, now: Date = new Date()): TimeLeft | null {
  if (!startAt) return null
  const diff = new Date(startAt).getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true }

  const totalSeconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor(totalSeconds / 3600) % 24,
    minutes: Math.floor(totalSeconds / 60) % 60,
    seconds: totalSeconds % 60,
    isOver: false,
  }
}
