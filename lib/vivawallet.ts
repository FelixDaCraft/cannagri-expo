import type { VivaWalletOrderRequest, VivaWalletOrderResponse } from '@/types'

const VIVA_API_BASE = process.env.VIVA_WALLET_DEMO_MODE === 'true'
  ? 'https://demo.vivapayments.com'
  : 'https://www.vivapayments.com'

/**
 * Get Basic Auth header for Viva Wallet API
 */
function getBasicAuthHeader(): string {
  const merchantId = process.env.VIVA_WALLET_MERCHANT_ID
  const apiKey = process.env.VIVA_WALLET_API_KEY

  if (!merchantId || !apiKey) {
    throw new Error('Viva Wallet credentials not configured')
  }

  const credentials = Buffer.from(`${merchantId}:${apiKey}`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Create a payment order in Viva Wallet
 */
export async function createVivaWalletOrder(
  orderData: VivaWalletOrderRequest & { successUrl?: string; failureUrl?: string }
): Promise<VivaWalletOrderResponse> {
  const authHeader = getBasicAuthHeader()
  const sourceCode = process.env.VIVA_WALLET_SOURCE_CODE || 'Default'
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  // Create order using the REST API
  const response = await fetch(`${VIVA_API_BASE}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      Amount: orderData.amount, // Amount in cents
      CustomerTrns: `Commande Cann'Agri Expo`,
      SourceCode: sourceCode,
      MerchantTrns: orderData.merchantTrns,
      Tags: ['cannagri-expo'],
      // Customer info for better tracking
      ...(orderData.customerEmail && { Email: orderData.customerEmail }),
      ...(orderData.customerFullName && { FullName: orderData.customerFullName }),
      ...(orderData.customerPhone && { Phone: orderData.customerPhone }),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Viva Wallet order error - Status:', response.status)
    console.error('Viva Wallet order error - Body:', error)
    console.error('Viva Wallet order error - URL:', `${VIVA_API_BASE}/api/orders`)
    console.error('Viva Wallet credentials - MerchantID:', process.env.VIVA_WALLET_MERCHANT_ID?.substring(0, 8) + '...')
    console.error('Viva Wallet credentials - API Key length:', process.env.VIVA_WALLET_API_KEY?.length)
    throw new Error(`Failed to create Viva Wallet order: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const orderCode = data.OrderCode || data.orderCode

  // Build checkout URL with redirect parameters
  const successUrl = `${baseUrl}/paiement/succes?orderId=${orderData.merchantTrns}&s=${orderCode}`
  const failureUrl = `${baseUrl}/paiement/echec?orderId=${orderData.merchantTrns}`

  // Use Redirect Checkout URL format with success/failure URLs
  let checkoutUrl = `${VIVA_API_BASE}/web/checkout?ref=${orderCode}`
  checkoutUrl += '&color=2E4A33'
  checkoutUrl += `&successUrl=${encodeURIComponent(successUrl)}`
  checkoutUrl += `&failUrl=${encodeURIComponent(failureUrl)}`

  console.log('[Viva Wallet] Checkout URL with redirects:', checkoutUrl)

  return {
    orderCode: orderCode.toString(),
    checkoutUrl,
  }
}

/**
 * Get order details from Viva Wallet
 * StateId values: 0=Pending, 1=Expired, 2=Canceled, 3=Paid, 4=Awaiting, 5=Refunded
 * For smart checkout: StateId 'F' means completed/paid
 */
export async function getVivaWalletOrder(orderCode: string) {
  const authHeader = getBasicAuthHeader()

  console.log(`[Viva Wallet] Checking order status for: ${orderCode}`)
  console.log(`[Viva Wallet] API URL: ${VIVA_API_BASE}/api/orders/${orderCode}`)

  const response = await fetch(`${VIVA_API_BASE}/api/orders/${orderCode}`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[Viva Wallet] Get order error:', error)
    throw new Error('Failed to get Viva Wallet order')
  }

  const data = await response.json()
  console.log('[Viva Wallet] Order response:', JSON.stringify(data, null, 2))

  return data
}

/**
 * Verify webhook signature from Viva Wallet
 */
export function verifyVivaWalletSignature(
  payload: string,
  signature: string | null
): boolean {
  if (!signature) return false

  // In demo mode, skip verification
  if (process.env.VIVA_WALLET_DEMO_MODE === 'true') {
    return true
  }

  // TODO: Implement proper signature verification for production
  return true
}
