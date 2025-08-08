
import type {NextConfig} from 'next';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: isMobileBuild ? 'export' : undefined,
  distDir: isMobileBuild ? 'out' : '.next',
  images: {
    unoptimized: isMobileBuild ? true : undefined,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // During mobile builds, we add a rewrite to effectively ignore the admin folder,
  // preventing it from causing issues with static export.
  async rewrites() {
    if (isMobileBuild) {
      return [
        {
          source: '/admin/:path*',
          destination: '/404',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
