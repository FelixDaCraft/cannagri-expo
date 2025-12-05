import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { siteConfig } from '@/config/site'

export function HeroSection() {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center bg-gradient-to-br from-cream via-cream to-sage/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232E4A33' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container-custom relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Decorative circles */}
              <div className="absolute inset-0 bg-sage/20 rounded-full scale-90 animate-pulse" />
              <div className="absolute inset-4 bg-sage/30 rounded-full" />

              {/* Main image placeholder */}
              <div className="relative z-10 w-full h-full flex items-center justify-center">
                <div className="relative w-4/5 h-4/5">
                  <Image
                    src="/images/hero-illustration.png"
                    alt="Illustration Cann'Agri Expo 2026"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <span className="inline-block px-4 py-2 bg-forest/10 text-forest font-medium rounded-full text-sm mb-6">
              {siteConfig.event.year} - Nouvelle édition
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-heading mb-6 leading-tight">
              Le Rendez-vous des<br />
              <span className="text-sage-700">Professionnels du Chanvre</span>
            </h1>

            <p className="text-lg md:text-xl text-body/80 mb-8 max-w-xl mx-auto lg:mx-0">
              Rejoignez-nous pour une journée exceptionnelle dédiée à la filière chanvre CBD.
              Exposants, conférences, networking et Platinum CBD Cup.
            </p>

            {/* Event Info */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              <div className="flex items-center gap-2 text-forest">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold">{siteConfig.event.date}</span>
              </div>
              <div className="flex items-center gap-2 text-forest">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold">{siteConfig.event.location}, {siteConfig.event.city}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/billetterie">
                <Button size="lg" className="w-full sm:w-auto">
                  Réserver mon Pass Pro
                </Button>
              </Link>
              <Link href="/pro">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Devenir Exposant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-forest/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  )
}
