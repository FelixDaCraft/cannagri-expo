'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'motion/react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, Button } from '@/components/ui'
import { Spotlight, FloatingParticles } from '@/components/ui/aceternity'
import { siteConfig } from '@/config/site'

interface InfosPratiques {
  eventDate: string
  eventTime: string
  eventLocation: string
  eventAddress: string
  eventCity: string
  accessTransport: string
  accessParking: string
  accessInfo: string
  ticketInfo: string
  contactEmail: string
  contactPhone: string
}

const defaultInfos: InfosPratiques = {
  eventDate: siteConfig.event.date,
  eventTime: '9h00 - 19h00',
  eventLocation: siteConfig.event.location,
  eventAddress: '2 Rue du Sénégal',
  eventCity: siteConfig.event.city,
  accessTransport: 'Tramway ligne 1, arrêt Médiathèque. Bus C3, C4, arrêt Chantiers Navals.',
  accessParking: 'Parking Médiathèque à 200m. Parking Commerce à 500m.',
  accessInfo: 'Le lieu est accessible aux personnes à mobilité réduite.',
  ticketInfo: 'Les billets sont disponibles en ligne. Présentez votre QR code à l\'entrée.',
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
}

// Composant Accordéon
function Accordion({
  title,
  icon,
  children,
  defaultOpen = false
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border border-sage/20 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-sage/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sage">{icon}</span>
          <span className="font-semibold text-heading">{title}</span>
        </div>
        <motion.svg
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="w-5 h-5 text-forest"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-sage/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function InfosPratiquesPage() {
  const t = useTranslations('practicalInfo')
  const [infos, setInfos] = useState<InfosPratiques>(defaultInfos)

  useEffect(() => {
    fetch('/api/admin/infos-pratiques')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setInfos({ ...defaultInfos, ...data })
        }
      })
      .catch(() => {
        // Use default infos
      })
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section - Compact on mobile */}
      <section className="relative py-12 md:py-20 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-20 hidden md:block" fill="#A4B494" />
        <FloatingParticles quantity={20} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <h1 className="text-3xl md:text-5xl font-heading font-bold text-cream mb-3">
              {t('title')}
            </h1>
            <p className="text-base md:text-xl text-cream/80 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-6 md:py-12">
        {/* Quick Info Bar - Sticky on mobile */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card variant="elevated" className="bg-gradient-to-r from-forest to-forest-600 text-white">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-bold">{infos.eventDate}</span>
                    <span className="text-white/70">|</span>
                    <span>{infos.eventTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{infos.eventLocation}</span>
                  </div>
                </div>
                <Link href="/billetterie" className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto whitespace-nowrap">
                    {t('tickets.buyButton')}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content - Single column on mobile */}
        <div className="space-y-4 md:space-y-6">
          {/* Map + Venue Image Row */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="elevated" className="overflow-hidden h-full">
                <div className="aspect-[4/3] md:aspect-video bg-sage/20 relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2710.5!2d-1.5235!3d47.1975!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4805c6e6c0e4e9e9%3A0x3a5e8f7c6d5b4a3c!2sL%27Agronaute!5e0!3m2!1sfr!2sfr!4v1703187600000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>
                <div className="p-3 bg-white border-t border-sage/10">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=2+Rue+du+Sénégal,44200+Nantes"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="primary" size="sm" className="w-full flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Itinéraire
                    </Button>
                  </a>
                </div>
              </Card>
            </motion.div>

            {/* Venue Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="hidden md:block"
            >
              <Card variant="elevated" className="overflow-hidden h-full">
                <img
                  src="https://custom-images.strikinglycdn.com/res/hrscywv4p/image/upload/c_limit,fl_lossy,h_1500,w_2000,f_auto,q_auto/371875/576788_85017.png"
                  alt="Vue du lieu - Cann'Agri Expo"
                  className="w-full h-full object-cover"
                />
              </Card>
            </motion.div>
          </div>

          {/* Address Card - Compact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-heading">{infos.eventLocation}</h3>
                    <p className="text-body/70 text-sm">{infos.eventAddress}, {infos.eventCity}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Accordions for Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="space-y-3"
          >
            {/* Transports */}
            <Accordion
              title={t('access.transport')}
              defaultOpen={true}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              }
            >
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm min-w-[300px]">
                  <thead>
                    <tr className="border-b border-sage/20">
                      <th className="text-left py-2 px-2 font-semibold text-forest">Ligne</th>
                      <th className="text-left py-2 px-2 font-semibold text-forest">Type</th>
                      <th className="text-left py-2 px-2 font-semibold text-forest">Arrêt</th>
                      <th className="text-left py-2 px-2 font-semibold text-forest">Dist.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sage/10">
                    <tr>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-green-600 text-white text-xs font-bold rounded">1</span>
                      </td>
                      <td className="py-2 px-2 text-body/70">Tram</td>
                      <td className="py-2 px-2 text-body/80 font-medium">Médiathèque</td>
                      <td className="py-2 px-2 text-body/70">150m</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded">C3</span>
                      </td>
                      <td className="py-2 px-2 text-body/70">Bus</td>
                      <td className="py-2 px-2 text-body/80 font-medium">Chantiers Navals</td>
                      <td className="py-2 px-2 text-body/70">100m</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-600 text-white text-xs font-bold rounded">C4</span>
                      </td>
                      <td className="py-2 px-2 text-body/70">Bus</td>
                      <td className="py-2 px-2 text-body/80 font-medium">Chantiers Navals</td>
                      <td className="py-2 px-2 text-body/70">100m</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 bg-purple-600 text-white text-xs font-bold rounded">E1</span>
                      </td>
                      <td className="py-2 px-2 text-body/70">Navibus</td>
                      <td className="py-2 px-2 text-body/80 font-medium">Gare Maritime</td>
                      <td className="py-2 px-2 text-body/70">200m</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Accordion>

            {/* Parking */}
            <Accordion
              title={t('access.parking')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              }
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-sage/5 rounded-lg">
                  <span className="font-medium">Parking Médiathèque</span>
                  <span className="text-sm text-body/70">200m</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-sage/5 rounded-lg">
                  <span className="font-medium">Parking Commerce</span>
                  <span className="text-sm text-body/70">500m</span>
                </div>
              </div>
            </Accordion>

            {/* Accessibilité */}
            <Accordion
              title={t('access.accessibility')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <p className="text-body/70">{infos.accessInfo}</p>
            </Accordion>

            {/* Contact */}
            <Accordion
              title={t('contact.title')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            >
              <div className="space-y-2">
                <a
                  href={`mailto:${infos.contactEmail}`}
                  className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg hover:bg-sage/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{infos.contactEmail}</span>
                </a>
                <a
                  href={`tel:${infos.contactPhone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 p-3 bg-sage/5 rounded-lg hover:bg-sage/10 transition-colors"
                >
                  <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-sm">{infos.contactPhone}</span>
                </a>
              </div>
            </Accordion>
          </motion.div>

          {/* Social + Pro CTA Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid sm:grid-cols-2 gap-4"
          >
            {/* Social */}
            <Card variant="elevated">
              <CardContent className="p-4">
                <h3 className="font-semibold text-heading mb-3">{t('social.title')}</h3>
                <div className="flex gap-3">
                  {[
                    { href: siteConfig.social.facebook, icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                    { href: siteConfig.social.instagram, icon: <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /> },
                    { href: siteConfig.social.linkedin, icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
                  ].map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center text-forest hover:bg-forest hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        {social.icon}
                      </svg>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro CTA */}
            <Card variant="elevated" className="bg-gradient-to-br from-sage/30 to-sage/10 border border-sage/20">
              <CardContent className="p-4">
                <h3 className="font-semibold text-heading mb-2">{t('professional.title')}</h3>
                <p className="text-body/70 text-sm mb-3">{t('professional.description')}</p>
                <Link href="/pro">
                  <Button variant="outline" size="sm" className="w-full">
                    {t('professional.button')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
