/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ["@repo/prisma", "@repo/application", "@repo/domain"],
};

export default nextConfig;
