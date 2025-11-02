import { handle } from "hono/vercel";

import { buildApp } from "../core/app";
import { makeNodeDeps } from "./deps";

/**
 * Hono application instance wired with Node runtime dependencies.
 */
const app = buildApp(makeNodeDeps());
/**
 * Next.js/Vercel-compatible GET handler.
 * Delegates to the Hono app through `handle`.
 */
export const GET = handle(app);
/**
 * Next.js/Vercel-compatible POST handler.
 * Delegates to the Hono app through `handle`.
 */
export const POST = handle(app);
export { app };
