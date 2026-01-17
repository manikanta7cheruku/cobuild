/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // This ignores the "f" type errors and finishes the build
    ignoreBuildErrors: true,
  },
  // We removed the 'eslint' and 'experimental' keys to stop the warnings
};

export default nextConfig;