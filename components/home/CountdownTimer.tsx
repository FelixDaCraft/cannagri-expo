'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useEdition } from '@/components/editions'
import { getTimeLeft, type TimeLeft } from '@/lib/home/countdown'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Compte à rebours du hero, dans l'esprit de l'affiche : chiffres en Barlow Condensed
 * séparés par de fines lignes, sans boîtes. Les lecteurs d'écran n'entendent qu'une
 * phrase fixe (« ouverture dans 151 jours »), pas le défilement des secondes.
 */
export function CountdownTimer() {
  const t = useTranslations('home.hero.countdown')
  const edition = useEdition()
  // Rendu serveur sans heure précise : seules les valeurs calculées côté client s'affichent
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(edition.startAt))
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [edition.startAt])

  if (!edition.startAt) return null
  if (timeLeft?.isOver) return null

  const units = [
    { key: 'days', value: timeLeft ? String(timeLeft.days) : '–' },
    { key: 'hours', value: timeLeft ? pad(timeLeft.hours) : '–' },
    { key: 'minutes', value: timeLeft ? pad(timeLeft.minutes) : '–' },
    { key: 'seconds', value: timeLeft ? pad(timeLeft.seconds) : '–' },
  ] as const

  return (
    <div className="font-condensed">
      <p className="text-lg font-medium leading-none text-cream/75">
        {t('label')}
        {timeLeft && <span className="sr-only"> {t('summary', { days: timeLeft.days })}</span>}
      </p>
      <ol aria-hidden="true" className="mt-3 flex items-stretch">
        {units.map((unit, i) => (
          <li
            key={unit.key}
            className={i === 0 ? 'pr-4 sm:pr-6' : 'border-l border-cream/15 px-4 sm:px-6'}
          >
            <span
              className={`block min-w-[2ch] text-[2.5rem] font-semibold leading-none tabular-nums sm:text-[2.75rem] ${
                i === 0 ? 'text-mint' : 'text-cream'
              }`}
            >
              {unit.value}
            </span>
            <span className="mt-1.5 block text-base font-medium leading-none text-cream/70">{t(unit.key)}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
