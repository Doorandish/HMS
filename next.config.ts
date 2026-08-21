import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Multi-Tenant Configuration
   *
   * Enables subdomain and custom domain routing for tenant isolation.
   * In production, configure your reverse proxy (e.g., Caddy, Nginx)
   * to forward all subdomains to this Next.js instance.
   */

  // Allow images from tenant-configured domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Experimental features
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Headers for tenant context propagation
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, x-tenant-slug",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
