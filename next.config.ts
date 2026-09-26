import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Hide the Next.js Dev Tools badge (bottom-left). Dev-only; not part of the app.
  devIndicators: false,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
    ],
  },
};

export default nextConfig;
