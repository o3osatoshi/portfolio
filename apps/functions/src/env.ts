import { z } from "zod";

import { createLazyEnv } from "@o3osatoshi/toolkit";

export const env = createLazyEnv(
  {
    AUTH_GOOGLE_ID: z.string().min(1),
    AUTH_GOOGLE_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    EXCHANGE_RATE_HOST_API_KEY: z.string().min(1).optional(),
    EXCHANGE_RATE_HOST_BASE_URL: z.string().url().optional(),
  },
  { name: "functions" },
);
