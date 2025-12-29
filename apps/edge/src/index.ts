import { createAuthConfig as repoAuthCreateAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";
import { createEdgeUpstashCacheStore } from "@repo/integrations";

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
