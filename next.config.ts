import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Proxy the Nest API (../mywear-api) under this origin so its cookies are first-party and no CORS is needed
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  images: {
    // ponytail: Picsum stand-ins for campaign photography; swap for the real CDN host
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Product photos uploaded from /admin land in the Cloudflare R2 bucket's public URL
      { protocol: "https", hostname: "*.r2.dev", pathname: "/products/**" },
    ],
  },
};

export default nextConfig;
