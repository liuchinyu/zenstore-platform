// next.config.ts
import type { NextConfig } from "next";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const nextConfig: NextConfig = {
  typescript: {
    // 在生產環境建置時忽略 TypeScript 錯誤
    ignoreBuildErrors: true,
  },
  eslint: {
    // 在生產環境建置時忽略 ESLint 錯誤
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: (() => {
      const isUnoptimized = process.env.NEXT_IMAGE_UNOPTIMIZED === "true";
      console.log(
        `[NextConfig] Image Optimization Unoptimized: ${isUnoptimized}`,
      );
      return isUnoptimized;
    })(),
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "comeon.zenitron.com.tw",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "comeon.zenitron.com.tw",
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (config, { isServer, dev }) => {
    // 僅在客戶端且非開發模式下使用分析器
    if (!isServer && !dev) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: 8888,
          openAnalyzer: true,
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
