import { createAuthConfig } from "@repo/auth";
import { createEdgeUpstashRedis } from "@repo/integrations";
import { buildEdgeHandler } from "@repo/interface/http/edge";

import { env } from "@/env/server";
import { initWebEdgeLogger } from "@/lib/logger/edge";

export const runtime = "edge";

initWebEdgeLogger();

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  secret: env.AUTH_SECRET,
});

const cacheStore = createEdgeUpstashRedis({
  token: env.UPSTASH_REDIS_REST_TOKEN,
  url: env.UPSTASH_REDIS_REST_URL,
});

export const { GET, POST } = buildEdgeHandler({
  authConfig,
  cacheStore,
});
