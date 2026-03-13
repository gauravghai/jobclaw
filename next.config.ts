import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["react-globe.gl", "globe.gl", "three-globe"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.linkedin.com" },
      { protocol: "https", hostname: "*.indeed.com" },
      { protocol: "https", hostname: "*.glassdoor.com" },
      { protocol: "https", hostname: "*.ziprecruiter.com" },
      { protocol: "https", hostname: "*.googleapis.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
      { protocol: "https", hostname: "logo.clearbit.com" },
      { protocol: "https", hostname: "media.licdn.com" },
    ],
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
