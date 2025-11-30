import { createAuthConfig as repoAuthCreateAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";

const app = buildEdgeApp({
  createAuthConfig: (c) =>
    repoAuthCreateAuthConfig({
      secret: c.env.AUTH_SECRET,
    }),
  createRedisClientOptions: (c) => ({
    token: c.env.UPSTASH_REDIS_REST_TOKEN,
    url: c.env.UPSTASH_REDIS_REST_URL,
  }),
});

export default app;
