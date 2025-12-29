import { createAuthConfig as repoAuthCreateAuthConfig } from "@repo/auth";
import { createEdgeUpstashCacheStore } from "@repo/integrations";
import { buildEdgeApp } from "@repo/interface/http/edge";

const app = buildEdgeApp({
  createAuthConfig: (c) =>
    repoAuthCreateAuthConfig({
      secret: c.env.AUTH_SECRET,
    }),
  createCacheStore: (c) =>
    createEdgeUpstashCacheStore({
      token: c.env.UPSTASH_REDIS_REST_TOKEN,
      url: c.env.UPSTASH_REDIS_REST_URL,
    }),
});

export default app;
