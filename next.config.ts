import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  // Proxy the Nest API (../mywear-api) under this origin so its cookies are first-party and no CORS is needed
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
  images: {
    remotePatterns: [
      // Product and campaign photos live in the Cloudflare R2 bucket's public URL
      { protocol: "https", hostname: "*.r2.dev", pathname: "/products/**" },
    ],
  },
};

export default nextConfig;
