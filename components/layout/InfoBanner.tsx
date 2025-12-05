import Link from 'next/link'
import { siteConfig } from '@/config/site'

export function InfoBanner() {
  return (
    <div className="bg-sage text-forest py-3">
      <div className="container-custom">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm font-medium">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {siteConfig.event.date}
          </span>
          <span className="hidden sm:inline text-forest/50">|</span>
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {siteConfig.event.location}, {siteConfig.event.city}
          </span>
          <span className="hidden sm:inline text-forest/50">|</span>
          <Link
            href="/billetterie"
            className="flex items-center gap-2 hover:text-forest-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Billetterie : Janvier 2026
          </Link>
        </div>
      </div>
    </div>
  )
}
