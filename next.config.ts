import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Ensure Prisma binaries are included in serverless functions
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Include Prisma files in the build output
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't externalize Prisma to ensure binaries are bundled
      config.externals = (config.externals || []).filter(
        (external) => !(typeof external === 'string' && external.includes('@prisma'))
      );
    }
    return config;
  },
};

export default nextConfig;
