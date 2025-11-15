import type { AuthConfig, AuthUser } from "@repo/auth";
import { initAuthConfig, verifyAuth } from "@repo/auth/middleware";
import { type Context, Hono } from "hono";
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
 *
 * - {@link AuthConfig} can be created via `createAuthConfig` from `@repo/auth`.
 */
export type EdgeDeps =
  | { authConfig: AuthConfig; createAuthConfig?: (c: Context) => AuthConfig }
  | { authConfig?: AuthConfig; createAuthConfig: (c: Context) => AuthConfig };

/**
 * Build the Edge-ready HTTP application.
 *
 * Routes (mounted under `/edge`):
 * - `/public/*` — Routes that do not require authentication.
 * - `/private/*` — Routes that require authentication.
 *
 * Example:
 * - GET `/public/healthz` — Liveness probe.
 * - GET `/private/me` — Returns the authenticated user info.
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware},
 * `initAuthConfig`, `verifyAuth`.
 *
 * @param deps Implementations of {@link EdgeDeps}.
 * @returns Configured Hono app instance.
 */
export function buildEdgeApp(deps: EdgeDeps) {
  const app = new Hono().basePath("/edge");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  const authConfigHandler = (c: Context) => {
    if (deps.authConfig !== undefined) {
      return deps.authConfig;
    } else {
      // @ts-expect-error
      return deps.createAuthConfig(c);
    }
  };
  app.use("*", initAuthConfig(authConfigHandler));

  app.route("/public", buildEdgePublicRoutes());
  app.route("/private", buildEdgePrivateRoutes());

  return app;
}

/**
 * Build Next.js/Vercel-compatible handlers for the Edge runtime.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/edge/[...route]/route.ts
 * import { createAuthConfig } from "@repo/auth";
 * import { buildEdgeHandler } from "@repo/interface/http/edge";
 *
 * export const runtime = "edge";
 *
 * const authConfig = createAuthConfig({
 *   providers: { google: { clientId: "...", clientSecret: "..." } },
 *   secret: "...",
 * });
 *
 * export const { GET, POST } = buildEdgeHandler({ authConfig });
 * ```
 */
export function buildEdgeHandler(deps: EdgeDeps) {
  const app = buildEdgeApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}

function buildEdgePrivateRoutes() {
  const app = new Hono();

  app.use("/*", verifyAuth());

  app.get("/me", (c) => {
    const { session }: AuthUser = c.get("authUser");
    return c.json({ ...session.user });
  });

  return app;
}

function buildEdgePublicRoutes() {
  const app = new Hono();

  app.get("/healthz", (c) => c.json({ ok: true }));

  return app;
}
