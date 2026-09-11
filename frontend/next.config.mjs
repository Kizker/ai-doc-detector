/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === "true";

const nextConfig = {
  reactStrictMode: true,
  ...(isExport ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
  ...(!isExport
    ? {
        async rewrites() {
          return [
            {
              source: "/api/:path*",
              destination: process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000/api/:path*",
            },
          ];
        },
      }
    : {}),
};

export default nextConfig;

