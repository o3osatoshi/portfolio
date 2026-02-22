import type { AuthConfig, CliPrincipal, ResolveCliPrincipalInput } from "@repo/auth";
import { authHandler, initAuthConfig } from "@repo/auth/middleware";
import type { FxQuoteProvider, TransactionRepository } from "@repo/domain";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { requestIdMiddleware } from "../core";
import type { ContextEnv } from "../core/types";
import { loggerMiddleware } from "./middlewares";
import { buildCliRoutes } from "./routes/cli";
import { buildPrivateRoutes } from "./routes/private";
import { buildPublicRoutes } from "./routes/public";

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
  /** Provider required by FX-quote use cases. */
  fxQuoteProvider: FxQuoteProvider;
  /** Resolve and provision the internal user principal for CLI access tokens. */
  resolveCliPrincipal: (
    input: ResolveCliPrincipalInput,
  ) => ResultAsync<CliPrincipal, RichError>;
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
    .route("/cli", buildCliRoutes(deps))
    .route("/public", buildPublicRoutes(deps))
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
 * import { ExchangeRateApi } from "@repo/integrations";
 * import { buildHandler } from "@repo/interface/http/node";
 * import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
 * export const runtime = "nodejs";
 *
 * const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
 * const transactionRepo = new PrismaTransactionRepository(prisma);
 * const fxQuoteProvider = new ExchangeRateApi({
 *   apiKey: process.env.EXCHANGE_RATE_API_KEY,
 *   baseUrl: process.env.EXCHANGE_RATE_BASE_URL,
 * });
 * const authConfig = createAuthConfig({
 *   providers: {
 *     oidc: {
 *       clientId: process.env.AUTH_OIDC_CLIENT_ID!,
 *       clientSecret: process.env.AUTH_OIDC_CLIENT_SECRET!,
 *       issuer: process.env.AUTH_OIDC_ISSUER!,
 *     },
 *   },
 *   prismaClient: prisma,
 *   secret: process.env.AUTH_SECRET!,
 * });
 *
 * export const { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT } = buildHandler({
 *   authConfig,
 *   fxQuoteProvider,
 *   resolveCliPrincipal,
 *   transactionRepo,
 * });
 * ```
 */
export function buildHandler(deps: Deps) {
  const app = buildApp(deps);
  const GET = handle(app);
  const HEAD = handle(app);
  const OPTIONS = handle(app);
  const POST = handle(app);
  const PATCH = handle(app);
  const PUT = handle(app);
  const DELETE = handle(app);
  return { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT };
}

function buildAuthRoutes() {
  return new Hono<ContextEnv>().use("/*", authHandler());
}
