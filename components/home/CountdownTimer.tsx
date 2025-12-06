'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { siteConfig } from '@/config/site'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(): TimeLeft {
  const eventDate = new Date(siteConfig.event.dateISO + 'T10:00:00')
  const now = new Date()
  const difference = eventDate.getTime() - now.getTime()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  }
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center"
    >
      <motion.div
        key={value}
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative"
      >
        <div className="bg-forest text-cream w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl flex items-center justify-center shadow-lg border border-forest-600">
          <span className="font-heading font-bold text-2xl sm:text-3xl md:text-4xl">
            {String(value).padStart(2, '0')}
          </span>
        </div>
        {/* Reflection effect */}
        <div className="absolute inset-x-0 -bottom-1 h-2 bg-gradient-to-b from-forest/20 to-transparent rounded-b-xl" />
      </motion.div>
      <span className="mt-2 text-xs sm:text-sm font-medium text-forest/70 uppercase tracking-wider">
        {label}
      </span>
    </motion.div>
  )
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAddToCalendar = () => {
    const eventTitle = encodeURIComponent("Cann'Agri Expo 2026")
    const eventDetails = encodeURIComponent(
      "Le salon de référence du chanvre CBD - L'Agronaute, Nantes"
    )
    const eventLocation = encodeURIComponent("L'Agronaute, Nantes, France")
    const startDate = '20260328T100000'
    const endDate = '20260328T190000'

    // Google Calendar URL
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&details=${eventDetails}&location=${eventLocation}&dates=${startDate}/${endDate}`

    window.open(googleUrl, '_blank')
  }

  const handleDownloadICS = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cann'Agri Expo//FR
BEGIN:VEVENT
DTSTART:20260328T100000
DTEND:20260328T190000
SUMMARY:Cann'Agri Expo 2026
DESCRIPTION:Le salon de référence du chanvre CBD
LOCATION:L'Agronaute, Nantes, France
END:VEVENT
END:VCALENDAR`

    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'cannagri-expo-2026.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!mounted) {
    return (
      <section className="py-16 bg-cream">
        <div className="container-custom">
          <div className="flex justify-center gap-3 sm:gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="bg-forest/20 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-xl animate-pulse" />
                <div className="mt-2 h-4 w-12 bg-forest/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-cream relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-mint/20 rounded-full blur-3xl -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-terracotta/10 rounded-full blur-3xl translate-y-1/2" />

      <div className="container-custom relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-terracotta/10 text-terracotta font-medium rounded-full text-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
            Save the date
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-forest mb-2">
            {siteConfig.event.date}
          </h2>
          <p className="text-forest/70">
            {siteConfig.event.location}, {siteConfig.event.city}
          </p>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="flex justify-center gap-3 sm:gap-4 md:gap-6 mb-10"
        >
          <TimeUnit value={timeLeft.days} label="Jours" />
          <div className="flex items-center text-forest/30 text-2xl font-bold self-start mt-6 sm:mt-8">:</div>
          <TimeUnit value={timeLeft.hours} label="Heures" />
          <div className="flex items-center text-forest/30 text-2xl font-bold self-start mt-6 sm:mt-8">:</div>
          <TimeUnit value={timeLeft.minutes} label="Minutes" />
          <div className="hidden sm:flex items-center text-forest/30 text-2xl font-bold self-start mt-6 sm:mt-8">:</div>
          <div className="hidden sm:block">
            <TimeUnit value={timeLeft.seconds} label="Secondes" />
          </div>
        </motion.div>

        {/* Add to Calendar buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <motion.button
            onClick={handleAddToCalendar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-forest text-forest font-heading font-semibold rounded-xl shadow-md hover:bg-forest hover:text-cream transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
            </svg>
            Google Calendar
          </motion.button>
          <motion.button
            onClick={handleDownloadICS}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest/10 text-forest font-heading font-semibold rounded-xl hover:bg-forest/20 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Télécharger .ics
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
