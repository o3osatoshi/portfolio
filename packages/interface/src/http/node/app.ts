import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { TransactionRepository } from "@repo/domain";
import { Hono } from "hono";

import { toHttpErrorResponse } from "@o3osatoshi/toolkit";

import { loggerMiddleware, requestIdMiddleware } from "../core/middlewares";
import { respond } from "../core/respond";

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
  app.get("/labs/transactions", (c) =>
    respond(c)(
      parseGetTransactionsRequest({
        userId: c.req.query("userId"),
      }).asyncAndThen((dto) => getTransactions.execute(dto)),
    ),
  );

  return app;
}
