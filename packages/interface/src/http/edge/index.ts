import { handle } from "hono/vercel";

import { buildEdgeApp, type EdgeDeps } from "./app";

export { buildEdgeApp } from "./app";

/**
 * Build Next.js/Vercel-compatible handlers for the Edge runtime.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/edge/[...route]/route.ts
 * import { buildEdgeHandler } from "@repo/interface/http/edge";
 * export const runtime = "edge";
 * export const { GET, POST } = buildEdgeHandler({});
 * ```
 */
export function buildEdgeHandler(deps: EdgeDeps) {
  const app = buildEdgeApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}
