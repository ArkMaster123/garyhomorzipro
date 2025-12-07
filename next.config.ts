import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
