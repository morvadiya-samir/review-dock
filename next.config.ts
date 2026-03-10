import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from external domains
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  // Required to allow the review iframe to load properly
  async headers() {
    return [
      {
        // The review interface pages need relaxed CSP to load the proxy iframe
        source: "/review/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self'; frame-src 'self' http: https:;",
          },
        ],
      },
      {
        // Proxy responses: remove X-Frame-Options so the iframe loads
        source: "/api/proxy",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
    ];
  },

  // Silence the hydration warnings for browser extensions
  reactStrictMode: true,

  // Experimental features
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
  },
};

export default nextConfig;
