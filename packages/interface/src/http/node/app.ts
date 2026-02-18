import {
  CreateTransactionUseCase,
  DeleteTransactionUseCase,
  GetFxQuoteUseCase,
  GetTransactionsUseCase,
  parseCreateTransactionRequest,
  parseDeleteTransactionRequest,
  parseGetFxQuoteRequest,
  parseGetTransactionsRequest,
  parseUpdateTransactionRequest,
  UpdateTransactionUseCase,
} from "@repo/application";
import type {
  CreateTransactionResponse,
  GetFxQuoteResponse,
  GetTransactionsResponse,
} from "@repo/application";
import { type AuthConfig, type CliPrincipal, getAuthUserId } from "@repo/auth";
import { authHandler, initAuthConfig, verifyAuth } from "@repo/auth/middleware";
import type { FxQuoteProvider, TransactionRepository } from "@repo/domain";
import { type Context, Hono } from "hono";
import { handle } from "hono/vercel";
import {
  err,
  errAsync,
  ok,
  okAsync,
  type Result,
  ResultAsync,
} from "neverthrow";

import {
  newRichError,
  type RichError,
  toHttpErrorResponse,
} from "@o3osatoshi/toolkit";

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
  /** Provider required by FX-quote use cases. */
  fxQuoteProvider: FxQuoteProvider;
  /** Resolve and provision the internal user principal for CLI access tokens. */
  resolveCliPrincipal: (
    input: ResolveCliPrincipalInput,
  ) => ResultAsync<CliPrincipal, RichError>;
  /** Repository required by transaction use cases. */
  transactionRepo: TransactionRepository;
};

export type ResolveCliPrincipalInput = {
  accessToken: string;
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

function buildCliRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .use("/v1/*", async (c, next) => {
      const accessToken = extractBearerToken(c.req.header("authorization"));
      if (accessToken.isErr()) return errorResponse(c, accessToken.error);

      const principalResult = await deps.resolveCliPrincipal({
        accessToken: accessToken.value,
      });
      if (principalResult.isErr())
        return errorResponse(c, principalResult.error);

      c.set("cliPrincipal", principalResult.value);
      c.get("requestLogger")?.setUserId?.(principalResult.value.userId);
      return await next();
    })
    .get("/v1/me", (c) => {
      const principal = c.get("cliPrincipal") as CliPrincipal;
      return respondAsync<CliPrincipal>(c)(
        requireScope(principal, "transactions:read").map(() => principal),
      );
    })
    .get("/v1/transactions", (c) => {
      const principal = c.get("cliPrincipal") as CliPrincipal;
      const getTransactions = new GetTransactionsUseCase(deps.transactionRepo);
      return respondAsync<GetTransactionsResponse>(c)(
        requireScope(principal, "transactions:read").andThen(() =>
          parseGetTransactionsRequest({
            userId: principal.userId,
          }).asyncAndThen((req) => getTransactions.execute(req)),
        ),
      );
    })
    .post("/v1/transactions", (c) => {
      const principal = c.get("cliPrincipal") as CliPrincipal;
      const createTransaction = new CreateTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<CreateTransactionResponse>(c)(
        requireScope(principal, "transactions:write")
          .andThen(() =>
            ResultAsync.fromPromise(
              c.req.json<Record<string, unknown>>(),
              (cause) =>
                newRichError({
                  cause,
                  code: "CLI_REQUEST_BODY_INVALID",
                  details: {
                    action: "ParseCliCreateTransactionBody",
                    reason: "Request body must be valid JSON.",
                  },
                  i18n: { key: "errors.application.validation" },
                  isOperational: true,
                  kind: "Validation",
                  layer: "Presentation",
                }),
            ),
          )
          .andThen((body) =>
            parseCreateTransactionRequest({
              ...(body as Record<string, unknown>),
              userId: principal.userId,
            }),
          )
          .andThen((req) => createTransaction.execute(req)),
      );
    })
    .patch("/v1/transactions/:id", (c) => {
      const principal = c.get("cliPrincipal") as CliPrincipal;
      const updateTransaction = new UpdateTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<void>(c)(
        requireScope(principal, "transactions:write")
          .andThen(() =>
            ResultAsync.fromPromise(
              c.req.json<Record<string, unknown>>(),
              (cause) =>
                newRichError({
                  cause,
                  code: "CLI_REQUEST_BODY_INVALID",
                  details: {
                    action: "ParseCliUpdateTransactionBody",
                    reason: "Request body must be valid JSON.",
                  },
                  i18n: { key: "errors.application.validation" },
                  isOperational: true,
                  kind: "Validation",
                  layer: "Presentation",
                }),
            ),
          )
          .andThen((body) =>
            parseUpdateTransactionRequest({
              ...(body as Record<string, unknown>),
              id: c.req.param("id"),
            }),
          )
          .andThen((req) => updateTransaction.execute(req, principal.userId)),
      );
    })
    .delete("/v1/transactions/:id", (c) => {
      const principal = c.get("cliPrincipal") as CliPrincipal;
      const deleteTransaction = new DeleteTransactionUseCase(
        deps.transactionRepo,
      );
      return respondAsync<void>(c)(
        requireScope(principal, "transactions:write").andThen(() =>
          parseDeleteTransactionRequest({
            id: c.req.param("id"),
            userId: principal.userId,
          }).asyncAndThen((req) => deleteTransaction.execute(req)),
        ),
      );
    });
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

function buildPublicRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .get("/healthz", (c) => c.json({ ok: true }))
    .get("/exchange-rate", (c) => {
      const query = c.req.query();
      const getFxQuote = new GetFxQuoteUseCase(deps.fxQuoteProvider);
      return respondAsync<GetFxQuoteResponse>(c)(
        parseGetFxQuoteRequest({
          base: query["base"],
          quote: query["quote"],
        }).asyncAndThen((res) => getFxQuote.execute(res)),
      );
    });
}

function errorResponse(c: Context<ContextEnv>, error: RichError) {
  c.set("error", error);
  const { body, statusCode } = toHttpErrorResponse(error);
  return c.json(body, { status: statusCode });
}

function extractBearerToken(
  authorization: null | string | undefined,
): Result<string, RichError> {
  if (!authorization) {
    return err(
      newRichError({
        code: "CLI_BEARER_TOKEN_MISSING",
        details: {
          action: "ExtractCliBearerToken",
          reason: "Authorization header is missing.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  const matched = authorization.match(/^Bearer\s+(.+)$/i);
  if (!matched || !matched[1]) {
    return err(
      newRichError({
        code: "CLI_BEARER_TOKEN_MALFORMED",
        details: {
          action: "ExtractCliBearerToken",
          reason: "Authorization header must use Bearer scheme.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  return ok(matched[1]);
}

function requireScope(
  principal: CliPrincipal,
  requiredScope: string,
): ResultAsync<void, RichError> {
  if (principal.scopes.includes(requiredScope)) {
    return okAsync(undefined);
  }

  return errAsync(
    newRichError({
      code: "CLI_SCOPE_FORBIDDEN",
      details: {
        action: "AuthorizeCliScope",
        reason: `Required scope is missing: ${requiredScope}`,
      },
      i18n: { key: "errors.application.forbidden" },
      isOperational: true,
      kind: "Forbidden",
      layer: "Presentation",
    }),
  );
}
