const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Recommended for containerized deployments — only the files actually
  // needed at runtime get copied into the final Docker image.
  output: "standalone",

  images: {
    // Lets next/image load product photos directly from the backend.
    // Plain <img> tags don't need this, but it's here so swapping to
    // next/image later (for automatic resizing/lazy-loading) doesn't
    // require touching config again.
    remotePatterns: [
      {
        protocol: new URL(API_URL).protocol.replace(":", ""),
        hostname: new URL(API_URL).hostname,
        port: new URL(API_URL).port || undefined,
        pathname: "/assets/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        // NOTE: this previously had no fallback — if
        // NEXT_PUBLIC_API_URL was ever unset, the destination became
        // the literal string "undefined/api/:path*" and every API call
        // broke. API_URL above always has a value.
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
