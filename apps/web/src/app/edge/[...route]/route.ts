import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

import { env } from "@/env/server";

export const runtime = "edge";

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  secret: env.AUTH_SECRET,
});

export const { GET, POST } = buildEdgeHandler({ authConfig });
