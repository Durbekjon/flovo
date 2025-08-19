import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://eventify.preview.uz/:path*",
      },
    ];
  },
};

export default nextConfig;
