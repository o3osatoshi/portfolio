import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    AUTH_OIDC_AUDIENCE: z.string().min(1),
    AUTH_OIDC_CLIENT_ID: z.string().min(1),
    AUTH_OIDC_CLIENT_SECRET: z.string().min(1),
    AUTH_OIDC_ISSUER: z.url(),
    AUTH_SECRET: z.string().min(1),
    AXIOM_API_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    EXCHANGE_RATE_API_KEY: z.string().min(1),
    EXCHANGE_RATE_BASE_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().min(1),
  },
  { name: "web:server" },
);
