import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

import { env } from "@/env/server";

export const runtime = "edge";

const authConfig = createAuthConfig({
  secret: env.AUTH_SECRET,
});

export const { GET, POST } = buildEdgeHandler({ authConfig });
