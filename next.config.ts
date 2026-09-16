import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "learn.smktelkom-mlg.sch.id",
      },
      {
        protocol: "https",
        hostname: "learn.smktelkom-mlg.sch.id",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
