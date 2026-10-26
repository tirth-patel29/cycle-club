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
    return [
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
    ];
  },
};

export default nextConfig;
