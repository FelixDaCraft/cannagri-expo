import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Append pgbouncer + connection_timeout params for Neon pooler compatibility
function getDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (url.includes('-pooler.') && !url.includes('pgbouncer=true')) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}pgbouncer=true&connect_timeout=15`
  }
  return url
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: getDatasourceUrl(),
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
