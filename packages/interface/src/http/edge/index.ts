import { handle } from "hono/vercel";

import { buildEdgeApp } from "./app";
import { makeEdgeDeps } from "./deps";

/**
 * Runtime wiring for Edge environments (Cloudflare Workers, Next.js Edge).
 * - Base path: `/edge`
 */
const app = buildEdgeApp(makeEdgeDeps());

/**
 * Next.js/Vercel-compatible handlers.
 */
export const GET = handle(app);
export const POST = handle(app);

export { app };
export default app;
