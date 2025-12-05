'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { BentoGrid, BentoGridItem } from '@/components/ui/aceternity'
import { pillars } from '@/config/site'

const iconMap: Record<string, React.ReactNode> = {
  leaf: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21c-4.97 0-9-4.03-9-9 0-4.97 4.03-9 9-9s9 4.03 9 9c0 .34-.02.67-.05 1M12 21V12M12 12l3-3M12 12L9 9M15 21a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  ),
  settings: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  mic: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  heart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

const headerBackgrounds = [
  <div key="1" className="absolute inset-0 flex items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity }}
      className="w-20 h-20 rounded-full bg-gradient-to-br from-sage/40 to-forest/20"
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(164,180,148,0.1)_100%)]" />
  </div>,
  <div key="2" className="absolute inset-0 flex items-center justify-center overflow-hidden">
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      className="grid grid-cols-3 gap-2 opacity-30"
    >
      {[...Array(9)].map((_, i) => (
        <div key={i} className="w-8 h-8 rounded bg-forest/30" />
      ))}
    </motion.div>
  </div>,
  <div key="3" className="absolute inset-0 flex items-center justify-center">
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="w-16 h-16 rounded-full border-2 border-sage/40"
    />
    <motion.div
      animate={{ scale: [1.2, 1, 1.2] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute w-24 h-24 rounded-full border border-sage/20"
    />
  </div>,
  <div key="4" className="absolute inset-0 flex items-center justify-center">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      className="relative w-24 h-24"
    >
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 rounded-full bg-sage/40"
          style={{
            top: `${50 + 40 * Math.sin((i * Math.PI) / 3)}%`,
            left: `${50 + 40 * Math.cos((i * Math.PI) / 3)}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </motion.div>
  </div>,
]

export function PillarsSection() {
  return (
    <section className="py-16 md:py-24 bg-cream relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-sage/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-forest/5 rounded-full blur-3xl" />

      <div className="container-custom relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-heading mb-4">
            Au Coeur de la Filière
          </h2>
          <p className="text-lg text-body/70 max-w-2xl mx-auto">
            Découvrez les acteurs clés de l&apos;industrie du chanvre CBD français et européen
            réunis pour une journée exceptionnelle.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <BentoGrid className="lg:grid-cols-4">
          {pillars.map((pillar, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={pillar.link || '#'} className="block h-full">
                <BentoGridItem
                  title={pillar.title}
                  description={pillar.description}
                  icon={iconMap[pillar.icon]}
                  header={headerBackgrounds[index]}
                  className="h-full hover:-translate-y-1 transition-transform cursor-pointer"
                />
              </Link>
            </motion.div>
          ))}
        </BentoGrid>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { number: '50+', label: 'Exposants' },
            { number: '1000+', label: 'Visiteurs attendus' },
            { number: '10+', label: 'Conférences' },
            { number: '1', label: 'Journée unique' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 rounded-2xl bg-white/50 backdrop-blur-sm border border-sage/10 shadow-sm"
            >
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-forest to-sage bg-clip-text text-transparent mb-1">
                {stat.number}
              </div>
              <div className="text-body/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
