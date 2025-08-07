
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
};

export default nextConfig;
