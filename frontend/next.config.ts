import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['yjs', 'y-websocket'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('yjs', 'y-websocket', 'ws');
    }
    return config;
  },
};

export default nextConfig;
