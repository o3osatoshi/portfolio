import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { GetTransactionsResponse } from "@repo/application";
import { type AuthConfig, getAuthUserId } from "@repo/auth";
import { authHandler, initAuthConfig, verifyAuth } from "@repo/auth/middleware";
import type { TransactionRepository } from "@repo/domain";
import { Hono } from "hono";
import { handle } from "hono/vercel";

import { requestIdMiddleware, respondAsync, userIdMiddleware } from "../core";
import type { ContextEnv } from "../core/types";
import { loggerMiddleware } from "./middlewares";

/**
 * Concrete Hono app type for the Node HTTP interface.
 *
 * Useful for deriving a typed RPC client via `hono/client`.
 */
export type AppType = ReturnType<typeof buildApp>;

/**
 * Dependencies required by {@link buildApp}.
 *
 * Provide infrastructure-backed implementations in production (e.g. DB).
 */
export type Deps = {
  /** Hono Auth.js configuration (see `@repo/auth#createAuthConfig`). */
  authConfig: AuthConfig;
  /** Repository required by transaction use cases. */
  transactionRepo: TransactionRepository;
};

/**
 * Build the Node HTTP application.
 *
 * Routes (mounted under `/api`):
 * - `/auth/*` — Auth.js handlers.
 * - `/public/*` — Routes that do not require authentication.
 * - `/private/*` — Routes that require authentication.
 *
 * Example:
 * - GET `/public/healthz` — Liveness probe.
 * - GET `/private/labs/transactions` — Returns `Transaction[]` for the authenticated user.
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware}
 * Errors: normalized via `toHttpErrorResponse` from `@o3osatoshi/toolkit`. Zod
 * validation failures are handled by {@link respondZodError}.
 *
 * @param deps Implementations of {@link Deps}.
 * @returns Configured Hono app instance.
 */
export function buildApp(deps: Deps) {
  return new Hono<ContextEnv>()
    .basePath("/api")
    .use("*", requestIdMiddleware, loggerMiddleware)
    .use(
      "*",
      initAuthConfig(() => deps.authConfig),
    )
    .route("/auth", buildAuthRoutes())
    .route("/public", buildPublicRoutes())
    .route("/private", buildPrivateRoutes(deps));
}

/**
 * Build Next.js/Vercel-compatible handlers for the Node runtime.
 *
 * Notes:
 * - Both `GET` and `POST` are bound to the same underlying Hono app via
 *   `handle(app)`. Unimplemented methods for a route will return 404.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/api/[...route]/route.ts
 * import { createAuthConfig } from "@repo/auth";
 * import { buildHandler } from "@repo/interface/http/node";
 * import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
 * export const runtime = "nodejs";
 *
 * const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
 * const transactionRepo = new PrismaTransactionRepository(prisma);
 * const authConfig = createAuthConfig({
 *   providers: { google: { clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! } },
 *   prismaClient: prisma,
 *   secret: process.env.AUTH_SECRET!,
 * });
 *
 * export const { GET, POST } = buildHandler({ authConfig, transactionRepo });
 * ```
 */
export function buildHandler(deps: Deps) {
  const app = buildApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}

function buildAuthRoutes() {
  return new Hono<ContextEnv>().use("/*", authHandler());
}

function buildPrivateRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .use("/*", verifyAuth(), userIdMiddleware)
    .get("/labs/transactions", (c) => {
      const getTransactions = new GetTransactionsUseCase(deps.transactionRepo);
      return respondAsync<GetTransactionsResponse>(c)(
        parseGetTransactionsRequest({
          userId: getAuthUserId(c.get("authUser")),
        }).asyncAndThen((res) => getTransactions.execute(res)),
      );
    });
}

function buildPublicRoutes() {
  return new Hono<ContextEnv>().get("/healthz", (c) => c.json({ ok: true }));
}
