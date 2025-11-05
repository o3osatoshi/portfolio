import { handle } from "hono/vercel";

import { buildApp } from "./app";
import { makeNodeDeps } from "./deps";

/**
 * Runtime wiring for Node environments (Next.js API, Firebase, etc.).
 * - Base path: `/api`
 */
const app = buildApp(makeNodeDeps());

/**
 * Next.js/Vercel-compatible handlers.
 */
export const GET = handle(app);
export const POST = handle(app);

export { app };
export default app;

export { createExpressRequestHandler } from "./adapter-express";
