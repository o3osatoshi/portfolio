/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  transpilePackages: [
    "@repo/interface",
    "@repo/prisma",
    "@repo/application",
    "@repo/domain",
  ],
};

export default nextConfig;
