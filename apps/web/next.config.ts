import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@orghub/ui", "@orghub/config", "@orghub/db"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
    ],
  },
  experimental: {
    // Enable React 19 features
    ppr: false,
  },
};

export default nextConfig;
