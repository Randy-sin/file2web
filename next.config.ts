import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // 在Next.js 14.0.4+中，这是增加API超时的正确配置，单位为秒
    proxyTimeout: 60, // 5分钟（300秒）
    // 增加客户端路由缓存时间
    staleTimes: {
      dynamic: 30,
      static: 180,
    }
  },
};

export default nextConfig;
