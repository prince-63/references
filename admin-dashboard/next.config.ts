import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'prod-patient-gallery-ds.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dev-patient-gallery-ds.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'dev-patient-gallery.s3.ap-south-1.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
