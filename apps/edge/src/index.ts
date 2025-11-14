import { createAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";

import { env } from "./env";

const authConfig = createAuthConfig({
  secret: env.AUTH_SECRET,
});

const app = buildEdgeApp({ authConfig });

export default app;
