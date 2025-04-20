import type { NextConfig } from "next";
import path from "path";

const prismaDir = path.resolve("src/prisma");

const nextConfig: NextConfig & {
  outputFileTracingIncludes: Record<string, string[]>;
} = {
  outputFileTracingIncludes: {
    "app/**": [prismaDir],
  },
};

export default nextConfig;
