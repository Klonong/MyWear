import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // ponytail: Picsum stand-ins for campaign photography; swap for the real CDN host
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
