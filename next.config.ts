
import type {NextConfig} from 'next';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
  // Conditional configuration for mobile build
  ...(isMobileBuild
    ? {
        output: 'export',
        distDir: 'out',
        // Redirect all admin paths to prevent them from being included in the static export
        async redirects() {
          return [
            {
              source: '/admin/:path*',
              destination: '/',
              permanent: false,
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;
