import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set - payments will be in demo mode')
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null

export const STRIPE_PUBLIC_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || ''

// Check if Stripe is in demo mode
export const isStripeEnabled = !!process.env.STRIPE_SECRET_KEY && !!STRIPE_PUBLIC_KEY

// Product metadata for different ticket types
export const TICKET_PRODUCTS = {
  VISITEUR: {
    name: 'Billet Visiteur - Cann\'Agri Expo',
    description: 'Entrée au salon Cann\'Agri Expo',
  },
  PASS_PRO: {
    name: 'Pass Pro - Cann\'Agri Expo',
    description: 'Accès privilégié au salon Cann\'Agri Expo',
  },
  VIP: {
    name: 'Pass VIP - Cann\'Agri Expo',
    description: 'Accès VIP avec avantages exclusifs',
  },
}

// Create Stripe checkout session for tickets
export async function createTicketCheckoutSession({
  items,
  customerEmail,
  customerName,
  orderId,
  successUrl,
  cancelUrl,
}: {
  items: { type: string; price: number; quantity: number }[]
  customerEmail: string
  customerName: string
  orderId: string
  successUrl: string
  cancelUrl: string
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'eur',
      unit_amount: Math.round(item.price * 100), // In cents
      product_data: {
        name: TICKET_PRODUCTS[item.type as keyof typeof TICKET_PRODUCTS]?.name || `Billet ${item.type}`,
        description: TICKET_PRODUCTS[item.type as keyof typeof TICKET_PRODUCTS]?.description,
      },
    },
    quantity: item.quantity,
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    client_reference_id: orderId,
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId,
      customerName,
      type: 'VISITOR_TICKET',
    },
    locale: 'fr',
    payment_intent_data: {
      metadata: {
        orderId,
      },
    },
  })

  return session
}

// Create Stripe checkout session for stand booking
export async function createStandCheckoutSession({
  standCode,
  standSurface,
  priceHT,
  priceTTC,
  customerEmail,
  customerName,
  companyName,
  orderId,
  successUrl,
  cancelUrl,
}: {
  standCode: string
  standSurface: number
  priceHT: number
  priceTTC: number
  customerEmail: string
  customerName: string
  companyName?: string
  orderId: string
  successUrl: string
  cancelUrl: string
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerEmail,
    client_reference_id: orderId,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(priceTTC * 100), // In cents
          product_data: {
            name: `Stand ${standCode} - Cann'Agri Expo`,
            description: `Location de stand ${standSurface}m² - ${priceHT}€ HT (TVA 20%)`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId,
      customerName,
      companyName: companyName || '',
      type: 'STAND_BOOKING',
      standCode,
    },
    locale: 'fr',
    payment_intent_data: {
      metadata: {
        orderId,
        standCode,
      },
    },
    // For B2B, collect billing address
    billing_address_collection: 'required',
  })

  return session
}

// Verify webhook signature
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('Stripe is not configured')
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured')
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
}
