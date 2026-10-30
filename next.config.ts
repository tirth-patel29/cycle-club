import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/',
          has: [
            {
              type: 'header',
              key: 'x-razorpay-signature',
            },
          ],
          destination: '/api/webhooks/razorpay',
        },
        {
          source: '/',
          has: [
            {
              type: 'header',
              key: 'x-razorpay-event-id',
            },
          ],
          destination: '/api/webhooks/razorpay',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://api.razorpay.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' data: https://fonts.gstatic.com https://*.razorpay.com",
              "img-src 'self' data: blob: https: https://*.razorpay.com https://images.unsplash.com",
              "frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
              "connect-src 'self' wss: https://api.razorpay.com https://*.razorpay.com https://checkout.razorpay.com https://lumberjack.razorpay.com https://*.neon.tech",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
