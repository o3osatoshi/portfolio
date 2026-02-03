import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  cacheLife: {
    dataLong: {
      revalidate: 60 * 60 * 24,
      expire: 60 * 60 * 24,
      stale: 0,
    },
    errorShort: {
      revalidate: 60,
      expire: 60,
      stale: 0,
    },
    staticPage: {
      revalidate: 60 * 60 * 24 * 7,
      expire: 60 * 60 * 24 * 30,
      stale: 0,
    },
  },
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

export default withNextIntl(nextConfig);
