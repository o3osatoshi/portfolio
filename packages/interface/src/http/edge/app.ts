import {
  type HeavyProcessCachedResponse,
  HeavyProcessCachedUseCase,
  type HeavyProcessResponse,
  HeavyProcessUseCase,
} from "@repo/application";
import type { AuthConfig, User } from "@repo/auth";
import { userSchema } from "@repo/auth";
import { initAuthConfig, verifyAuth } from "@repo/auth/middleware";
import type { CacheStore } from "@repo/domain";
import { type Context, Hono } from "hono";
import { handle } from "hono/vercel";

import { parseWith } from "@o3osatoshi/toolkit";

import {
  requestIdMiddleware,
  respond,
  respondAsync,
  userIdMiddleware,
} from "../core";
import type { ContextEnv } from "../core/types";
import { loggerMiddleware } from "./middlewares";

/**
 * Concrete Hono app type for the Edge HTTP interface.
 *
 * Useful for deriving a typed RPC client via `hono/client`.
 */
export type EdgeAppType = ReturnType<typeof buildEdgeApp>;

/**
 * Dependencies required by {@link buildEdgeApp}.
 *
 * - `AuthConfig` can be created via `createAuthConfig` from `@repo/auth`.
 */
export type EdgeDeps = EdgeDepsAuth & EdgeDepsCache;

export type EdgeDepsAuth =
  | { authConfig: AuthConfig; createAuthConfig?: (c: Context) => AuthConfig }
  | { authConfig?: AuthConfig; createAuthConfig: (c: Context) => AuthConfig };

export type EdgeDepsCache = {
  cacheStore?: CacheStore;
  createCacheStore?: (c: Context) => CacheStore;
};

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
  const authConfigHandler = (c: Context) => {
    if (deps.authConfig !== undefined) {
      return deps.authConfig;
    } else {
      // @ts-expect-error
      return deps.createAuthConfig(c);
    }
  };
  return new Hono<ContextEnv>()
    .basePath("/edge")
    .use("*", requestIdMiddleware, loggerMiddleware)
    .use("*", initAuthConfig(authConfigHandler))
    .route("/public", buildEdgePublicRoutes(deps))
    .route("/private", buildEdgePrivateRoutes());
}

/**
 * Build Next.js/Vercel-compatible handlers for the Edge runtime.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/edge/[...route]/route.ts
 * import { createAuthConfig } from "@repo/auth";
 * import { createEdgeUpstashRedis } from "@repo/integrations";
 * import { buildEdgeHandler } from "@repo/interface/http/edge";
 *
 * export const runtime = "edge";
 *
 * const authConfig = createAuthConfig({
 *   providers: { google: { clientId: "...", clientSecret: "..." } },
 *   secret: "...",
 * });
 *
 * const cacheStore = createEdgeUpstashRedis({
 *   token: "...",
 *   url: "...",
 * });
 *
 * export const { GET, POST } = buildEdgeHandler({ authConfig, cacheStore });
 * ```
 */
export function buildEdgeHandler(deps: EdgeDeps) {
  const app = buildEdgeApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}

function buildEdgePrivateRoutes() {
  return new Hono<ContextEnv>()
    .use("/*", verifyAuth(), userIdMiddleware)
    .get("/me", (c) => {
      const authUser = c.get("authUser");
      return respond<User>(c)(
        parseWith<typeof userSchema>(userSchema, {
          action: "Parse user from session",
        })(authUser?.session.user ?? {}),
      );
    });
}

function buildEdgePublicRoutes(deps: EdgeDeps) {
  const cacheStore = (c: Context) => {
    if (deps.cacheStore !== undefined) {
      return deps.cacheStore;
    }
    if (deps.createCacheStore !== undefined) {
      return deps.createCacheStore(c);
    }
    return undefined;
  };
  return new Hono<ContextEnv>()
    .get("/healthz", (c) => c.json({ ok: true }))
    .get("/heavy", (c) => {
      const heavyProcess = new HeavyProcessUseCase();
      return respondAsync<HeavyProcessResponse>(c)(heavyProcess.execute());
    })
    .get("/heavy/cached", (c) => {
      const store = cacheStore(c);
      if (!store) {
        const heavyProcess = new HeavyProcessUseCase();
        return respondAsync<HeavyProcessCachedResponse>(c)(
          heavyProcess.execute().map((res) => ({ ...res, cached: false })),
        );
      }
      const heavyProcessCached = new HeavyProcessCachedUseCase(store);
      return respondAsync<HeavyProcessCachedResponse>(c)(
        heavyProcessCached.execute(),
      );
    });
}
