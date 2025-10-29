import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // External packages for server components
  serverExternalPackages: ['@prisma/client', 'prisma'],
  // Include Prisma binaries in serverless function output
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/client/**/*'],
    '/*': ['./node_modules/.prisma/client/**/*'],
  },
};

export default nextConfig;
