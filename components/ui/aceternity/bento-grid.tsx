'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface BentoGridProps {
  className?: string
  children?: React.ReactNode
}

export const BentoGrid: React.FC<BentoGridProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  )
}

interface BentoGridItemProps {
  className?: string
  title?: string | React.ReactNode
  description?: string | React.ReactNode
  header?: React.ReactNode
  icon?: React.ReactNode
}

export const BentoGridItem: React.FC<BentoGridItemProps> = ({
  className,
  title,
  description,
  header,
  icon,
}) => {
  return (
    <div
      className={cn(
        'row-span-1 rounded-2xl group/bento hover:shadow-xl transition-all duration-300 shadow-md p-6 bg-white border border-sage/10 flex flex-col space-y-4 overflow-hidden',
        className
      )}
    >
      {header && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden bg-gradient-to-br from-sage/10 to-forest/5">
          {header}
        </div>
      )}
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="flex items-center gap-3 mb-2">
          {icon && (
            <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center text-forest">
              {icon}
            </div>
          )}
          {title && (
            <div className="font-heading font-bold text-heading text-lg">
              {title}
            </div>
          )}
        </div>
        {description && (
          <div className="text-body/70 text-sm leading-relaxed">
            {description}
          </div>
        )}
      </div>
    </div>
  )
}
