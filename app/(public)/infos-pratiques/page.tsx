'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
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
  eventAddress: '24 quai de la Fosse',
  eventCity: siteConfig.event.city,
  accessTransport: 'Tramway ligne 1, arrêt Médiathèque. Bus C3, C4, arrêt Chantiers Navals.',
  accessParking: 'Parking Médiathèque à 200m. Parking Commerce à 500m.',
  accessInfo: 'Le lieu est accessible aux personnes à mobilité réduite.',
  ticketInfo: 'Les billets sont disponibles en ligne. Présentez votre QR code à l\'entrée.',
  contactEmail: siteConfig.contact.email,
  contactPhone: siteConfig.contact.phone,
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
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-br from-forest via-forest to-forest-600 overflow-hidden">
        <Spotlight className="-top-40 left-20" fill="#A4B494" />
        <Spotlight className="top-10 right-0" fill="#4a6b50" />
        <FloatingParticles quantity={35} colors={['rgba(164, 180, 148, 0.5)', 'rgba(244, 241, 232, 0.3)']} />

        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-sage/20 backdrop-blur-sm border border-sage/30"
            >
              <svg className="w-8 h-8 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-cream mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-xl text-cream/80 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
      </section>

      <div className="container-custom py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Date & Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <h2 className="text-xl font-heading font-bold text-heading mb-6 flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </motion.div>
                    {t('dateLocation.title')}
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-sage/5 rounded-xl border border-sage/10"
                    >
                      <h3 className="font-semibold text-heading mb-2">{t('dateLocation.date')}</h3>
                      <p className="text-2xl font-bold text-forest mb-1">{infos.eventDate}</p>
                      <p className="text-body/70">{infos.eventTime}</p>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-sage/5 rounded-xl border border-sage/10"
                    >
                      <h3 className="font-semibold text-heading mb-2">{t('dateLocation.location')}</h3>
                      <p className="text-lg font-semibold text-heading">{infos.eventLocation}</p>
                      <p className="text-body/70">{infos.eventAddress}</p>
                      <p className="text-body/70">{infos.eventCity}</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Access */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <h2 className="text-xl font-heading font-bold text-heading mb-6 flex items-center gap-2">
                    <motion.div
                      whileHover={{ rotate: 10 }}
                      className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </motion.div>
                    {t('access.title')}
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'transport',
                        content: infos.accessTransport,
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        ),
                      },
                      {
                        key: 'parking',
                        content: infos.accessParking,
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        ),
                      },
                      {
                        key: 'accessibility',
                        content: infos.accessInfo,
                        icon: (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ),
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        whileHover={{ x: 5 }}
                        className="p-4 bg-sage/5 rounded-xl border border-sage/10"
                      >
                        <h3 className="font-semibold text-heading mb-2 flex items-center gap-2">
                          <span className="text-sage">{item.icon}</span>
                          {t(`access.${item.key}`)}
                        </h3>
                        <p className="text-body/70">{item.content}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="elevated" className="overflow-hidden">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="aspect-video bg-sage/20 relative"
                >
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2710.5!2d-1.5620!3d47.2130!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDEyJzQ3LjAiTiAxwrAzMyczNy4wIlc!5e0!3m2!1sfr!2sfr!4v1"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </motion.div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tickets */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card variant="elevated" className="relative overflow-hidden bg-gradient-to-br from-forest to-forest-600 text-white">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                  }} />
                </div>
                <CardContent className="relative z-10">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4"
                  >
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-heading font-bold text-cream mb-4">
                    {t('tickets.title')}
                  </h2>
                  <p className="text-white/80 mb-6">
                    {infos.ticketInfo}
                  </p>
                  <Link href="/billetterie">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="secondary" className="w-full">
                        {t('tickets.buyButton')}
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <h2 className="text-xl font-heading font-bold text-heading mb-4">
                    {t('contact.title')}
                  </h2>
                  <div className="space-y-3">
                    <motion.a
                      href={`mailto:${infos.contactEmail}`}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 bg-sage/5 rounded-xl text-body hover:text-forest hover:bg-sage/10 transition-all"
                    >
                      <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm">{infos.contactEmail}</span>
                    </motion.a>
                    <motion.a
                      href={`tel:${infos.contactPhone.replace(/\s/g, '')}`}
                      whileHover={{ x: 5 }}
                      className="flex items-center gap-3 p-3 bg-sage/5 rounded-xl text-body hover:text-forest hover:bg-sage/10 transition-all"
                    >
                      <div className="w-10 h-10 bg-sage/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <span className="text-sm">{infos.contactPhone}</span>
                    </motion.a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card variant="elevated" className="group hover:shadow-xl transition-all duration-300">
                <CardContent>
                  <h2 className="text-xl font-heading font-bold text-heading mb-4">
                    {t('social.title')}
                  </h2>
                  <div className="flex gap-3">
                    {[
                      { href: siteConfig.social.facebook, icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
                      { href: siteConfig.social.instagram, icon: <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" /> },
                      { href: siteConfig.social.linkedin, icon: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /> },
                    ].map((social, index) => (
                      <motion.a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 bg-sage/20 rounded-full flex items-center justify-center text-forest hover:bg-forest hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          {social.icon}
                        </svg>
                      </motion.a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Exhibitor CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card variant="elevated" className="bg-gradient-to-br from-sage/30 to-sage/10 border border-sage/20">
                <CardContent>
                  <h2 className="text-xl font-heading font-bold text-heading mb-2">
                    {t('professional.title')}
                  </h2>
                  <p className="text-body/70 mb-4">
                    {t('professional.description')}
                  </p>
                  <Link href="/pro">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" className="w-full">
                        {t('professional.button')}
                      </Button>
                    </motion.div>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
