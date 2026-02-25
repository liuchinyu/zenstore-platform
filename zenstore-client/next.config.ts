// next.config.ts
import type { NextConfig } from "next";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";

const nextConfig: NextConfig = {
  typescript: {
    // 在生產環境建置時忽略 TypeScript 錯誤（建議設為 false，以確保程式碼品質）
    ignoreBuildErrors: false,
  },
  images: {
    // domains: ["comeon.zenitron.com.tw"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "comeon.zenitron.com.tw",
        port: "",
        pathname: "/upload/**",
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
        })
      );
    }
    return config;
  },
};

export default nextConfig;
