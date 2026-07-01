import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL is undefined in lib/prisma.ts")
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Provide a fallback dummy string so the adapter doesn't crash on instantiation
  const safeConnectionString = connectionString || 'postgresql://dummy:dummy@dummy/dummy'
  const adapter = new PrismaNeon({ connectionString: safeConnectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


