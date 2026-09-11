/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Output standalone build for lightweight production Docker containers
  output: "standalone",

  // API proxy to backend during development & production
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || "http://localhost:8000/api/:path*";
    return [
      {
        source: "/api/:path*",
        destination: backendUrl,
      },
    ];
  },
};

export default nextConfig;
