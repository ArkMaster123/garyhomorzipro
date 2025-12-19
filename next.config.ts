import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Replace test file imports with stub in production builds
    if (!process.env.PLAYWRIGHT && !process.env.CI_PLAYWRIGHT && !process.env.PLAYWRIGHT_TEST_BASE_URL) {
      const path = require('path');
      config.resolve.alias = {
        ...config.resolve.alias,
        './models.test': path.resolve(__dirname, 'lib/ai/models.test.stub.ts'),
      };
      
      // Ignore test utilities that require dev dependencies
      config.plugins = config.plugins || [];
      config.plugins.push(
        new (require('webpack').IgnorePlugin)({
          resourceRegExp: /^msw$/,
          contextRegExp: /@ai-sdk\/provider-utils\/dist\/test/,
        }),
        new (require('webpack').IgnorePlugin)({
          resourceRegExp: /^vitest$/,
          contextRegExp: /@ai-sdk\/provider-utils\/dist\/test/,
        })
      );
    }
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        hostname: 'avatar.vercel.sh',
      },
      {
        hostname: 'framerusercontent.com',
      },
      {
        hostname: 's3-eu-west-1.amazonaws.com',
      },
      {
        hostname: 'cache.sessionize.com',
      },
      {
        hostname: 'cdn.prod.website-files.com',
      },
    ],
  },
};

export default nextConfig;
