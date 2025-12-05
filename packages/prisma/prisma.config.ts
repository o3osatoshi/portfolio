import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: "./schema/migrations",
    seed: "tsx scripts/seed.ts",
  },
  schema: "./schema",
});
