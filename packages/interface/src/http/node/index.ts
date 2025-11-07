import { handle } from "hono/vercel";

import { buildApp, type Deps } from "./app";

export { createExpressRequestHandler } from "./adapter-express";

/**
 * Build Next.js/Vercel-compatible handlers for the Node runtime.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/api/[...route]/route.ts
 * import { buildHandler } from "@repo/interface/http/node";
 * import { PrismaTransactionRepository } from "@repo/prisma";
 * export const runtime = "nodejs";
 * export const { GET, POST } = buildHandler({
 *   transactionRepo: new PrismaTransactionRepository(),
 * });
 * ```
 */
export function buildHandler(deps: Deps) {
  const app = buildApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}

export { buildApp } from "./app";
