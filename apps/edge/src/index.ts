import { createAuthConfig as repoAuthCreateAuthConfig } from "@repo/auth";
import { createEdgeUpstashRedis } from "@repo/integrations";
import { buildEdgeApp } from "@repo/interface/http/edge";

import { initEdgeLogging } from "./logger";

const app = buildEdgeApp({
  createAuthConfig: (c) =>
    repoAuthCreateAuthConfig({
      secret: c.env.AUTH_SECRET,
    }),
  createCacheStore: (c) =>
    createEdgeUpstashRedis({
      token: c.env.UPSTASH_REDIS_REST_TOKEN,
      url: c.env.UPSTASH_REDIS_REST_URL,
    }),
});

const _fetch = app.fetch.bind(app);

app.fetch = (request, env, ctx) => {
  initEdgeLogging(env);
  return _fetch(request, env, ctx);
};

export default app;
