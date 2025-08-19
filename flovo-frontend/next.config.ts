import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://flovo.preview.uz/:path*",
      },
    ];
  },
};

export default nextConfig;
