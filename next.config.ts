import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "app/**": [path.join(__dirname, "src/prisma/**")],
  },
};

export default nextConfig;
