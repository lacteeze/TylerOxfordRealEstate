import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "moqhrfdqwpvucxoemcrg.supabase.co" },
    ],
    qualities: [75, 95],
  },
};

export default nextConfig;
