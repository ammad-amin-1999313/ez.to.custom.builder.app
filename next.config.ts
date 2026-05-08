import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow remote images (Clerk avatars and any user-supplied URLs in blocks).
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // Strict mode helps surface SSR issues early during the port.
  reactStrictMode: true,
};

export default nextConfig;
