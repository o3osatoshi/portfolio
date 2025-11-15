import { createAuthConfig as repoAuthCreateAuthConfig } from "@repo/auth";
import { buildEdgeApp } from "@repo/interface/http/edge";

const app = buildEdgeApp({
  createAuthConfig: (c) =>
    repoAuthCreateAuthConfig({
      secret: c.env.AUTH_SECRET,
    }),
});

export default app;
