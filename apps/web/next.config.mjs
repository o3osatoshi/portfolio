/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@repo/interface",
    "@repo/prisma",
    "@repo/application",
    "@repo/domain",
  ],
};

export default nextConfig;
