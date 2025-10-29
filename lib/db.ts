import { PrismaClient } from '@prisma/client';
import path from 'path';

declare global {
  var prisma: PrismaClient | undefined;
}

// For Vercel serverless - ensure query engine is found
const queryEnginePath = path.join(process.cwd(), 'node_modules', '.prisma', 'client');
const queryEngineLibPath = path.join(queryEnginePath, 'libquery_engine-rhel-openssl-3.0.x.so.node');

// Prevent multiple instances of Prisma Client in development
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export default prisma;
