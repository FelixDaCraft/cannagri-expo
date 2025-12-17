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
  orderData: VivaWalletOrderRequest
): Promise<VivaWalletOrderResponse> {
  const authHeader = getBasicAuthHeader()

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
      SourceCode: 'Default', // Use default payment source
      MerchantTrns: orderData.merchantTrns,
      Tags: ['cannagri-expo'],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Viva Wallet order error:', error)
    throw new Error('Failed to create Viva Wallet order')
  }

  const data = await response.json()
  const orderCode = data.OrderCode || data.orderCode

  return {
    orderCode: orderCode.toString(),
    checkoutUrl: `${VIVA_API_BASE}/web/checkout?ref=${orderCode}`,
  }
}

/**
 * Get order details from Viva Wallet
 */
export async function getVivaWalletOrder(orderCode: string) {
  const authHeader = getBasicAuthHeader()

  const response = await fetch(`${VIVA_API_BASE}/api/orders/${orderCode}`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
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

  // In demo mode, skip verification
  if (process.env.VIVA_WALLET_DEMO_MODE === 'true') {
    return true
  }

  // TODO: Implement proper signature verification for production
  return true
}
