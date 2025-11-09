import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    DATABASE_URL: z.string().min(1).default(""),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  { name: "prisma" },
);
