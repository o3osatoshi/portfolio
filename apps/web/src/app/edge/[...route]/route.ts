import { createAuthConfig } from "@repo/auth";
import { createEdgeUpstashCacheStore } from "@repo/integrations";
import { buildEdgeHandler } from "@repo/interface/http/edge";

import { env } from "@/env/server";
import { initWebEdgeLogger } from "@/lib/logger/edge";

export const runtime = "edge";

initWebEdgeLogger();

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: String(env.AUTH_GOOGLE_ID),
      clientSecret: String(env.AUTH_GOOGLE_SECRET),
    },
  },
  secret: String(env.AUTH_SECRET),
});

const cacheStore = createEdgeUpstashCacheStore({
  token: String(env.UPSTASH_REDIS_REST_TOKEN),
  url: String(env.UPSTASH_REDIS_REST_URL),
});

export const { GET, POST } = buildEdgeHandler({
  authConfig,
  cacheStore,
});
