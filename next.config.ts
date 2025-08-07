
import type {NextConfig} from 'next';

const isMobileBuild = process.env.BUILD_TARGET === 'mobile';

const nextConfig: NextConfig = {
  // If this is a mobile build, use 'export'
  output: isMobileBuild ? 'export' : undefined,

  // If this is a mobile build, output to 'out' directory
  distDir: isMobileBuild ? 'out' : '.next',

  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Unoptimized images are required for static export
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
};

export default nextConfig;
