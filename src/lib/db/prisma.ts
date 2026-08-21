/**
 * Prisma Client Singleton
 *
 * Initializes PrismaClient with the PostgreSQL driver adapter
 * as required by Prisma v7. Uses the global singleton pattern
 * to prevent multiple instances during Next.js hot reloads.
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn(
      '[Prisma] DATABASE_URL not set. Database operations will fail.'
    );
  }

  const adapter = new PrismaPg({
    connectionString: connectionString || '',
  });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
