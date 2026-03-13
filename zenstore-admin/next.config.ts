import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // 開發測試
  async rewrites() {
    return [
      {
        source: "/api/admin/:path*",
        destination: "http://api-server:8080/api/admin/:path*",
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
