import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  experimental: {
    cacheLife: {
      dataLong: {
        expire: 60 * 60 * 24,
        revalidate: 60 * 60 * 24,
        stale: 0,
      },
      errorShort: {
        expire: 60,
        revalidate: 60,
        stale: 0,
      },
      staticPage: {
        expire: 60 * 60 * 24 * 30,
        revalidate: 60 * 60 * 24 * 7,
        stale: 0,
      },
    },
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
