import { createAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";

import { env } from "./env";

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  secret: env.AUTH_SECRET,
});

const app = buildEdgeApp({ authConfig });

export default app;
