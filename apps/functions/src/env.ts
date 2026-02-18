import { z } from "zod";

import { createLazyEnv } from "@o3osatoshi/toolkit";

export const env = createLazyEnv(
  {
    AUTH_CLI_IDENTITY_ISSUER_LIMIT_PER_MINUTE: z.coerce
      .number()
      .int()
      .positive()
      .default(60),
    AUTH_CLI_IDENTITY_SUBJECT_COOLDOWN_SECONDS: z.coerce
      .number()
      .int()
      .positive()
      .default(300),
    AUTH_OIDC_AUDIENCE: z.string().min(1),
    AUTH_OIDC_CLIENT_ID: z.string().min(1),
    AUTH_OIDC_CLIENT_SECRET: z.string().min(1),
    AUTH_OIDC_ISSUER: z.string().min(1),
    AUTH_SECRET: z.string().min(1),
    AXIOM_API_TOKEN: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    EXCHANGE_RATE_API_KEY: z.string().min(1),
    EXCHANGE_RATE_BASE_URL: z.url(),
    INNGEST_EVENT_KEY: z.string().min(1),
    INNGEST_SIGNING_KEY: z.string().min(1),
    SLACK_BOT_TOKEN: z.string().min(1),
    SLACK_CHANNEL_ID: z.string().min(1),
    STORE_PING_USER_ID: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
    UPSTASH_REDIS_REST_URL: z.string().min(1),
  },
  { name: "functions" },
);
