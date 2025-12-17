import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.SMTP_HOST = 'smtp.test.com'
process.env.SMTP_PORT = '587'
process.env.SMTP_USER = 'test@test.com'
process.env.SMTP_PASSWORD = 'password'
process.env.EMAIL_FROM = 'noreply@test.com'
process.env.VIVA_WALLET_MERCHANT_ID = 'test-merchant-id'
process.env.VIVA_WALLET_API_KEY = 'test-api-key'
process.env.VIVA_WALLET_DEMO_MODE = 'true'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Mock fetch globally
global.fetch = jest.fn()

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})
