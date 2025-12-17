'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button, Input, Card, CardContent, Badge } from '@/components/ui'
import { siteConfig } from '@/config/site'
import { formatPrice } from '@/lib/utils'

interface TicketOption {
  type: 'standard' | 'flex'
  name: string
  price: number
  description: string
  isRecommended?: boolean
  supportMessage?: string
}

const ticketOptions: TicketOption[] = [
  {
    type: 'standard',
    name: siteConfig.tickets.standard.name,
    price: siteConfig.tickets.standard.price,
    description: siteConfig.tickets.standard.description,
  },
  {
    type: 'flex',
    name: siteConfig.tickets.flex.name,
    price: siteConfig.tickets.flex.price,
    description: siteConfig.tickets.flex.description,
    isRecommended: true,
    supportMessage: 'Votre soutien nous permet d\'organiser de plus beaux événements !',
  },
]

const oauthProviders = [
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bg: 'bg-white hover:bg-gray-50',
    text: 'text-gray-700',
    border: 'border border-gray-300',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    bg: 'bg-black hover:bg-gray-900',
    text: 'text-white',
    border: '',
  },
]

interface Attendee {
  ticketType: 'standard' | 'flex'
  name: string
}

export function TicketForm() {
  const { data: session, status } = useSession()
  // Quantities for each ticket type
  const [ticketQuantities, setTicketQuantities] = useState<Record<'standard' | 'flex', number>>({
    standard: 0,
    flex: 0,
  })
  // Attendees with their ticket types
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auth form state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Calculate total quantity
  const totalQuantity = ticketQuantities.standard + ticketQuantities.flex

  // Update attendees array when quantities change
  useEffect(() => {
    setAttendees(prev => {
      const newAttendees: Attendee[] = []

      // Add standard tickets
      for (let i = 0; i < ticketQuantities.standard; i++) {
        const existing = prev.find((a, idx) => a.ticketType === 'standard' && idx === newAttendees.length)
        newAttendees.push({
          ticketType: 'standard',
          name: existing?.name || '',
        })
      }

      // Add flex tickets
      for (let i = 0; i < ticketQuantities.flex; i++) {
        const existingFlexCount = prev.filter(a => a.ticketType === 'flex').length
        const existingIdx = prev.findIndex((a, idx) => a.ticketType === 'flex' &&
          prev.slice(0, idx).filter(x => x.ticketType === 'flex').length === i)
        const existing = existingIdx >= 0 ? prev[existingIdx] : null
        newAttendees.push({
          ticketType: 'flex',
          name: existing?.name || '',
        })
      }

      return newAttendees
    })
  }, [ticketQuantities])

  // Pre-fill first attendee with user's name when authenticated and attendees change
  useEffect(() => {
    if (session?.user && attendees.length > 0 && !attendees[0].name) {
      setAttendees(prev => {
        const newAttendees = [...prev]
        if (newAttendees.length > 0 && !newAttendees[0].name && session.user.name) {
          newAttendees[0] = { ...newAttendees[0], name: session.user.name }
        }
        return newAttendees
      })
    }
  }, [session, attendees.length])

  const handleOAuthLogin = async (provider: string) => {
    setIsLoading(true)
    await signIn(provider, { callbackUrl: '/billetterie' })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    try {
      const result = await signIn('credentials', {
        email: authData.email,
        password: authData.password,
        redirect: false,
      })

      if (result?.error) {
        setAuthError('Email ou mot de passe incorrect')
      } else if (result?.ok) {
        window.location.reload()
      }
    } catch {
      setAuthError('Une erreur est survenue')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')

    if (authData.password !== authData.confirmPassword) {
      setAuthError('Les mots de passe ne correspondent pas')
      setAuthLoading(false)
      return
    }

    if (authData.password.length < 8) {
      setAuthError('Le mot de passe doit contenir au moins 8 caractères')
      setAuthLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authData.name,
          email: authData.email,
          password: authData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAuthError(data.error || 'Une erreur est survenue')
        return
      }

      // Auto login after registration
      const result = await signIn('credentials', {
        email: authData.email,
        password: authData.password,
        redirect: false,
      })

      if (result?.ok) {
        window.location.reload()
      }
    } catch {
      setAuthError('Une erreur est survenue')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (totalQuantity === 0 || !session?.user) return

    // Validate all attendee names are filled
    const emptyNames = attendees.filter(a => !a.name.trim())
    if (emptyNames.length > 0) {
      setError('Veuillez renseigner le nom de chaque détenteur de billet')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create individual ticket items for each attendee with their ticket type
      const ticketItems = attendees.map(attendee => {
        const ticketOption = ticketOptions.find(t => t.type === attendee.ticketType)!
        return {
          ticketType: attendee.ticketType.toUpperCase(),
          price: ticketOption.price,
          quantity: 1,
          attendeeName: attendee.name.trim(),
        }
      })

      const response = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'VISITOR_TICKET',
          items: ticketItems,
          customer: {
            name: session.user.name || attendees[0]?.name || '',
            email: session.user.email || '',
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue')
      }

      // Redirect to Viva Wallet checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate total based on all ticket quantities
  const total = ticketOptions.reduce((sum, ticket) => {
    return sum + ticket.price * ticketQuantities[ticket.type]
  }, 0)

  // Helper to get ticket option by type
  const getTicketOption = (type: 'standard' | 'flex') => ticketOptions.find(t => t.type === type)!

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Ticket Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div>
          <h2 className="text-2xl font-heading font-bold text-heading mb-4">
            1. Choisissez vos billets
          </h2>
          <div className="space-y-4">
            {ticketOptions.map((ticket) => (
              <Card
                key={ticket.type}
                variant={ticketQuantities[ticket.type] > 0 ? 'bordered' : 'default'}
                className={`transition-all ${
                  ticketQuantities[ticket.type] > 0
                    ? 'ring-2 ring-forest border-forest'
                    : ticket.isRecommended
                    ? 'ring-1 ring-terracotta/30'
                    : ''
                }`}
              >
                <CardContent>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-heading font-semibold text-heading">
                          {ticket.name}
                        </h3>
                        {ticket.isRecommended && (
                          <Badge variant="terracotta" className="text-xs">Recommandé</Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-forest mb-1">
                        {formatPrice(ticket.price)}
                      </p>
                      <p className="text-sm text-body/70">{ticket.description}</p>
                      {ticket.supportMessage && (
                        <p className="text-xs text-terracotta/90 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {ticket.supportMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        onClick={() => setTicketQuantities(prev => ({
                          ...prev,
                          [ticket.type]: Math.max(0, prev[ticket.type] - 1)
                        }))}
                        disabled={ticketQuantities[ticket.type] === 0}
                      >
                        -
                      </button>
                      <span className="text-xl font-semibold w-8 text-center">
                        {ticketQuantities[ticket.type]}
                      </span>
                      <button
                        type="button"
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        onClick={() => setTicketQuantities(prev => ({
                          ...prev,
                          [ticket.type]: Math.min(10, prev[ticket.type] + 1)
                        }))}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {totalQuantity > 0 && (
          <>
            {/* Step 2: Attendee Names */}
            <div>
              <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                2. Nom des participants
              </h2>
              <p className="text-sm text-body/70 mb-4">
                Chaque billet est nominatif. Veuillez indiquer le nom complet de chaque participant.
              </p>
              <div className="space-y-3">
                {attendees.map((attendee, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      id={`attendee-name-${index}`}
                      name={`attendee-name-${index}`}
                      autoComplete="off"
                      value={attendee.name}
                      onChange={(e) => {
                        const newAttendees = [...attendees]
                        newAttendees[index] = { ...newAttendees[index], name: e.target.value }
                        setAttendees(newAttendees)
                      }}
                      placeholder="Nom complet du participant"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                      required
                    />
                    <Badge variant={attendee.ticketType === 'flex' ? 'terracotta' : 'sage'} className="flex-shrink-0">
                      {getTicketOption(attendee.ticketType).name}
                    </Badge>
                  </div>
                ))}
              </div>
              <p className="text-xs text-body/50 mt-2">
                Le nom sera imprimé sur le billet et vérifié à l&apos;entrée.
              </p>
            </div>

            {/* Step 3: Authentication or Form */}
            {status === 'loading' ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest"></div>
              </div>
            ) : !session ? (
              <div>
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  3. Connectez-vous pour continuer
                </h2>
                <Card className="p-6">
                  {/* OAuth Providers */}
                  <div className="space-y-3 mb-6">
                    {oauthProviders.map((provider) => (
                      <button
                        key={provider.id}
                        onClick={() => handleOAuthLogin(provider.id)}
                        disabled={isLoading || authLoading}
                        className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${provider.bg} ${provider.text} ${provider.border} disabled:opacity-50`}
                      >
                        {provider.icon}
                        <span>Continuer avec {provider.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">ou avec email</span>
                    </div>
                  </div>

                  {/* Auth Mode Tabs */}
                  <div className="flex mb-4 border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError('') }}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        authMode === 'login'
                          ? 'text-forest border-b-2 border-forest'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Se connecter
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError('') }}
                      className={`flex-1 py-2 text-center font-medium transition-colors ${
                        authMode === 'register'
                          ? 'text-forest border-b-2 border-forest'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Créer un compte
                    </button>
                  </div>

                  {/* Auth Error */}
                  {authError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {authError}
                    </div>
                  )}

                  {/* Login Form */}
                  {authMode === 'login' ? (
                    <form name="ticket-login" onSubmit={handleEmailLogin} className="space-y-4" autoComplete="on">
                      <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="login-email"
                          name="login-email"
                          autoComplete="username"
                          value={authData.email}
                          onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe
                        </label>
                        <input
                          type="password"
                          id="login-password"
                          name="login-password"
                          autoComplete="current-password"
                          value={authData.password}
                          onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="Votre mot de passe"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? 'Connexion...' : 'Se connecter'}
                      </Button>
                    </form>
                  ) : (
                    <form name="ticket-register" onSubmit={handleEmailRegister} className="space-y-4" autoComplete="on">
                      <div>
                        <label htmlFor="register-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          id="register-name"
                          name="register-name"
                          autoComplete="name"
                          value={authData.name}
                          onChange={(e) => setAuthData({ ...authData, name: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="Jean Dupont"
                        />
                      </div>
                      <div>
                        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="register-email"
                          name="register-email"
                          autoComplete="email"
                          value={authData.email}
                          onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Mot de passe
                        </label>
                        <input
                          type="password"
                          id="register-password"
                          name="register-password"
                          autoComplete="new-password"
                          value={authData.password}
                          onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                          required
                          minLength={8}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="Minimum 8 caractères"
                        />
                      </div>
                      <div>
                        <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                          Confirmer le mot de passe
                        </label>
                        <input
                          type="password"
                          id="register-confirm-password"
                          name="register-confirm-password"
                          autoComplete="new-password"
                          value={authData.confirmPassword}
                          onChange={(e) => setAuthData({ ...authData, confirmPassword: e.target.value })}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest focus:border-transparent"
                          placeholder="Confirmez votre mot de passe"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={authLoading}>
                        {authLoading ? 'Création...' : 'Créer mon compte'}
                      </Button>
                      <p className="text-xs text-gray-500 text-center">
                        En créant un compte, vous acceptez nos{' '}
                        <Link href="/mentions-legales" className="text-forest hover:underline">
                          mentions légales
                        </Link>{' '}
                        et notre{' '}
                        <Link href="/confidentialite" className="text-forest hover:underline">
                          politique de confidentialité
                        </Link>
                      </p>
                    </form>
                  )}
                </Card>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-heading font-bold text-heading mb-4">
                  3. Confirmer et payer
                </h2>
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-800 font-medium">Connecté</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Vos billets seront envoyés à <strong>{session.user?.email}</strong>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  size="lg"
                  className="w-full"
                  isLoading={isLoading}
                  onClick={handleSubmit}
                >
                  Procéder au paiement - {formatPrice(total)}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card variant="bordered" className="sticky top-24">
          <CardContent>
            <h3 className="text-xl font-heading font-semibold text-heading mb-4">
              Récapitulatif
            </h3>

            {totalQuantity > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {ticketOptions.map((ticket) => {
                    const qty = ticketQuantities[ticket.type]
                    if (qty === 0) return null
                    return (
                      <div key={ticket.type} className="flex justify-between">
                        <span className="text-body/70">
                          {ticket.name} x {qty}
                        </span>
                        <span>{formatPrice(ticket.price * qty)}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Attendee names in summary */}
                {attendees.some(a => a.name.trim()) && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <p className="text-sm font-medium text-heading mb-2">Participants :</p>
                    <ul className="space-y-1">
                      {attendees.map((attendee, index) => (
                        <li key={index} className="text-sm text-body/70 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-sage/30 text-forest text-xs flex items-center justify-center flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="flex-1">
                            {attendee.name.trim() || <span className="italic text-body/40">Non renseigné</span>}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            attendee.ticketType === 'flex' ? 'bg-terracotta/10 text-terracotta' : 'bg-sage/30 text-forest'
                          }`}>
                            {attendee.ticketType === 'flex' ? 'Flex' : 'Std'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total TTC</span>
                    <span className="text-forest">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-cream rounded-lg">
                  <div className="flex items-start gap-2 text-sm text-body/70">
                    <svg className="w-5 h-5 text-forest flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>
                      Paiement sécurisé par Viva Wallet. Vous recevrez un e-billet nominatif par participant.
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-body/50 text-center py-8">
                Sélectionnez vos billets
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
