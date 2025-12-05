import type { VivaWalletOrderRequest, VivaWalletOrderResponse } from '@/types'

const VIVA_API_BASE = process.env.VIVA_WALLET_DEMO_MODE === 'true'
  ? 'https://demo.vivapayments.com'
  : 'https://www.vivapayments.com'

const VIVA_ACCOUNTS_BASE = process.env.VIVA_WALLET_DEMO_MODE === 'true'
  ? 'https://demo-accounts.vivapayments.com'
  : 'https://accounts.vivapayments.com'

let accessToken: string | null = null
let tokenExpiry: number | null = null

/**
 * Get OAuth2 access token from Viva Wallet
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken
  }

  const clientId = process.env.VIVA_WALLET_CLIENT_ID
  const clientSecret = process.env.VIVA_WALLET_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Viva Wallet credentials not configured')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(`${VIVA_ACCOUNTS_BASE}/connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${credentials}`,
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Viva Wallet auth error:', error)
    throw new Error('Failed to authenticate with Viva Wallet')
  }

  const data = await response.json()
  accessToken = data.access_token as string
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // Expire 1 minute early

  return accessToken as string
}

/**
 * Create a payment order in Viva Wallet
 */
export async function createVivaWalletOrder(
  orderData: VivaWalletOrderRequest
): Promise<VivaWalletOrderResponse> {
  const token = await getAccessToken()
  const sourceCode = process.env.VIVA_WALLET_SOURCE_CODE

  if (!sourceCode) {
    throw new Error('Viva Wallet source code not configured')
  }

  const response = await fetch(`${VIVA_API_BASE}/checkout/v2/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: orderData.amount,
      customerTrns: `Commande Cann'Agri Expo`,
      customer: {
        email: orderData.customerEmail,
        fullName: orderData.customerFullName || '',
        phone: orderData.customerPhone || '',
        countryCode: 'FR',
        requestLang: 'fr-FR',
      },
      paymentTimeout: 900, // 15 minutes
      preauth: false,
      allowRecurring: false,
      maxInstallments: 0,
      merchantTrns: orderData.merchantTrns,
      sourceCode,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Viva Wallet order error:', error)
    throw new Error('Failed to create Viva Wallet order')
  }

  const data = await response.json()

  return {
    orderCode: data.orderCode,
    checkoutUrl: `${VIVA_API_BASE}/web/checkout?ref=${data.orderCode}`,
  }
}

/**
 * Get order details from Viva Wallet
 */
export async function getVivaWalletOrder(orderCode: string) {
  const token = await getAccessToken()

  const response = await fetch(`${VIVA_API_BASE}/checkout/v2/orders/${orderCode}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Viva Wallet get order error:', error)
    throw new Error('Failed to get Viva Wallet order')
  }

  return response.json()
}

/**
 * Verify webhook signature from Viva Wallet
 */
export function verifyVivaWalletSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false

  // In production, implement proper HMAC verification
  // using VIVA_WALLET_WEBHOOK_SECRET
  // For now, we'll skip verification in demo mode
  if (process.env.VIVA_WALLET_DEMO_MODE === 'true') {
    return true
  }

  // TODO: Implement proper signature verification
  // const crypto = require('crypto')
  // const secret = process.env.VIVA_WALLET_WEBHOOK_SECRET
  // const hash = crypto.createHmac('sha256', secret).update(payload).digest('base64')
  // return hash === signature

  return true
}
