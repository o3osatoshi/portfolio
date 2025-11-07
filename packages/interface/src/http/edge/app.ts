import { Hono } from "hono";

import { loggerMiddleware, requestIdMiddleware } from "../core/middlewares";

/**
 * Concrete Hono app type for the Edge HTTP interface.
 *
 * Useful for deriving a typed RPC client via `hono/client`.
 */
export type EdgeAppType = ReturnType<typeof buildEdgeApp>;

/**
 * Dependencies required by {@link buildEdgeApp}.
 */
export type EdgeDeps = Record<string, never>;

/**
 * Build the Edge-ready HTTP application.
 *
 * Routes (mounted under `/edge`):
 * - GET `/healthz` — Liveness probe.
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware}
 *
 * @param _deps Implementations of {@link EdgeDeps}.
 * @returns Configured Hono app instance.
 */
export function buildEdgeApp(_deps: EdgeDeps) {
  const app = new Hono().basePath("/edge");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.get("/healthz", (c) => c.json({ ok: true }));

  return app;
}
