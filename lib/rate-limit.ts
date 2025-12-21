/**
 * Simple in-memory rate limiter for API routes
 * Uses sliding window algorithm for accurate rate limiting
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store for rate limiting (resets on server restart)
// For production with multiple instances, consider using Redis
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  })
}, 5 * 60 * 1000)

interface RateLimitConfig {
  // Maximum number of requests allowed in the window
  limit: number
  // Time window in seconds
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Result indicating if request is allowed and remaining quota
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const windowMs = config.windowSeconds * 1000
  const resetAt = now + windowMs

  const existing = rateLimitStore.get(identifier)

  // If no existing entry or window has expired, create new entry
  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return {
      success: true,
      remaining: config.limit - 1,
      resetAt,
    }
  }

  // Increment count
  existing.count++

  // Check if over limit
  if (existing.count > config.limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    }
  }

  return {
    success: true,
    remaining: config.limit - existing.count,
    resetAt: existing.resetAt,
  }
}

/**
 * Get client IP from request headers
 * Handles proxy headers (X-Forwarded-For, etc.)
 */
export function getClientIP(request: Request): string {
  // Check for forwarded headers (from reverse proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP in the chain (client IP)
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback - in production this shouldn't happen with proper proxy setup
  return 'unknown'
}

// Preset configurations for different endpoints
export const RATE_LIMIT_PRESETS = {
  // Strict limit for authentication endpoints (5 attempts per minute)
  AUTH: { limit: 5, windowSeconds: 60 },
  // Payment endpoints (10 per minute)
  PAYMENT: { limit: 10, windowSeconds: 60 },
  // API endpoints (60 per minute)
  API: { limit: 60, windowSeconds: 60 },
  // Very strict for sensitive operations (3 per 5 minutes)
  SENSITIVE: { limit: 3, windowSeconds: 300 },
} as const
