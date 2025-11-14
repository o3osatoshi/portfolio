import type { AuthConfig, AuthUser } from "@repo/auth";
import { initAuthConfig, verifyAuth } from "@repo/auth/middleware";
import { Hono } from "hono";
import { handle } from "hono/vercel";

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
export type EdgeDeps = {
  authConfig: AuthConfig;
};

/**
 * Build the Edge-ready HTTP application.
 *
 * Routes (mounted under `/edge`):
 * - GET `/healthz` — Liveness probe.
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware}
 *
 * @param deps Implementations of {@link EdgeDeps}.
 * @returns Configured Hono app instance.
 */
export function buildEdgeApp(deps: EdgeDeps) {
  const app = new Hono().basePath("/edge");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.use(
    "*",
    initAuthConfig(() => deps.authConfig),
  );

  app.use("/*", verifyAuth());

  app.get("/healthz", (c) => c.json({ ok: true }));

  app.get("/me", (c) => {
    const { session }: AuthUser = c.get("authUser");
    return c.json({ ...session.user });
  });

  return app;
}

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
