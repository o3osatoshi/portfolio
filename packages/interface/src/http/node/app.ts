import { zValidator } from "@hono/zod-validator";
import {
  getTransactionsRequestSchema,
  GetTransactionsUseCase,
} from "@repo/application";
import type { GetTransactionsResponse } from "@repo/application";
import type { TransactionRepository } from "@repo/domain";
import { Hono } from "hono";
import { handle } from "hono/vercel";

import { loggerMiddleware, requestIdMiddleware } from "../core/middlewares";
import { respond, respondZodError } from "../core/respond";

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
  /** Repository required by transaction use cases. */
  transactionRepo: TransactionRepository;
};

/**
 * Build the Node HTTP application.
 *
 * Routes (mounted under `/api`):
 * - GET `/healthz` — Liveness probe.
 * - GET `/labs/transactions?userId=...` — Returns `Transaction[]` for the user.
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware}
 * Errors: normalized via {@link toHttpErrorResponse}.
 *
 * @param deps Implementations of {@link Deps}.
 * @returns Configured Hono app instance.
 */
export function buildApp(deps: Deps) {
  const app = new Hono().basePath("/api");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.get("/healthz", (c) => c.json({ ok: true }));

  const getTransactions = new GetTransactionsUseCase(deps.transactionRepo);
  app.get(
    "/labs/transactions",
    zValidator("query", getTransactionsRequestSchema, respondZodError),
    (c) =>
      respond<GetTransactionsResponse>(c)(
        getTransactions.execute(c.req.valid("query")),
      ),
  );

  return app;
}

/**
 * Build Next.js/Vercel-compatible handlers for the Node runtime.
 *
 * Usage (Next.js App Router):
 * ```ts
 * // app/api/[...route]/route.ts
 * import { buildHandler } from "@repo/interface/http/node";
 * import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
 * export const runtime = "nodejs";
 * export const { GET, POST } = buildHandler({
 *   transactionRepo: new PrismaTransactionRepository(
 *     createPrismaClient({ connectionString: process.env.DATABASE_URL! }),
 *   ),
 * });
 * ```
 */
export function buildHandler(deps: Deps) {
  const app = buildApp(deps);
  const GET = handle(app);
  const POST = handle(app);
  return { GET, POST };
}
