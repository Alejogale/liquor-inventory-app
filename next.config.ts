import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Platform Configuration */
  
  // Image optimization for platform assets
  images: {
    domains: [
      'localhost',
      // Add your domain when deploying
      // 'yourdomain.com'
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // API configuration
  async rewrites() {
    return [
      // Platform API rewrites if needed
    ]
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Environment variable validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
};

export default nextConfig;
