import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true, // Skip type checking during build
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all hosts
      },
    ],
  },
};

export default nextConfig;
