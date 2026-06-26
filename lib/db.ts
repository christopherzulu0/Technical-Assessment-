import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const adapter = new PrismaPg({ connectionString })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
  })
}

let db: PrismaClient

if (process.env.NODE_ENV === 'production') {
  db = createPrismaClient()
} else {
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient
  }

  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = createPrismaClient()
  }
  db = globalWithPrisma.prisma
}

export { db }
