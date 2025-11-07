import { handle } from "hono/vercel";

import { buildEdgeApp, type EdgeDeps } from "./app";

export { buildEdgeApp } from "./app";

export function buildEdgeHandler(deps: EdgeDeps) {
  const app = buildEdgeApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}
