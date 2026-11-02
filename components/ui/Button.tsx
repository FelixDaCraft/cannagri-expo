'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-condensed font-semibold leading-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      // Charte 2027 : bleu nuit = structure, or = action principale (voir ButtonLink)
      primary: 'bg-forest text-cream hover:bg-forest-400',
      secondary: 'bg-mint text-forest hover:bg-mint-400',
      outline: 'border-2 border-forest/40 text-forest hover:border-forest hover:bg-forest/5',
      ghost: 'text-forest hover:bg-forest/10',
      link: 'text-forest underline underline-offset-4 decoration-forest/40 hover:decoration-mint',
    }

    const sizes = {
      // 44 px minimum de hauteur (cibles tactiles)
      sm: 'min-h-[44px] px-4 text-lg rounded-[10px]',
      md: 'min-h-[48px] px-6 text-xl rounded-[10px]',
      lg: 'min-h-[56px] px-8 text-[1.375rem] rounded-[10px]',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="h-4 w-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
