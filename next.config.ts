import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Prisma must be externalized for serverless - binaries are in node_modules
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'prisma'],
  },
};

export default nextConfig;
