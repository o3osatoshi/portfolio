import { handle } from "hono/vercel";

import { buildApp, type Deps } from "./app";

export { createExpressRequestHandler } from "./adapter-express";

export function buildHandler(deps: Deps) {
  const app = buildApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}

export { buildApp } from "./app";
