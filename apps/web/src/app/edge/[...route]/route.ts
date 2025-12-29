import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

import { env } from "@/env/server";
import { initWebEdgeLogger } from "@/lib/logging/edge";

export const runtime = "edge";

initWebEdgeLogger();

export const { GET, POST } = buildEdgeHandler({
  authConfig: createAuthConfig({
    secret: env.AUTH_SECRET,
  }),
  redisClientOptions: {
    token: env.UPSTASH_REDIS_REST_TOKEN,
    url: env.UPSTASH_REDIS_REST_URL,
  },
});
