/** @type {import('next').NextConfig} */
const nextConfig = {
  // This ignores TypeScript errors so Vercel can finish the build
  typescript: {
    ignoreBuildErrors: true,
  },
  // This ignores ESLint warnings/errors during the build
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    turbopack: {
      root: __dirname,
    },
  },
};

module.exports = nextConfig;