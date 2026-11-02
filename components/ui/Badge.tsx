import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'forest' | 'sage' | 'terracotta'
  size?: 'sm' | 'md'
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default: 'bg-forest/10 text-forest',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-orange-100 text-orange-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      forest: 'bg-forest text-cream',
      sage: 'bg-mint text-forest',
      terracotta: 'bg-mascot-deep text-cream',
    }

    const sizes = {
      sm: 'px-2 py-0.5 text-sm',
      md: 'px-3 py-1 text-base',
    }

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-condensed font-semibold leading-tight rounded-md',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge }
