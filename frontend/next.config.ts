import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['yjs', 'y-websocket', 'ws'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('yjs', 'y-websocket', 'ws');
    }
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
