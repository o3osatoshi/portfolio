import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { TransactionRepository } from "@repo/domain";
import { Hono } from "hono";

import { toHttpErrorResponse } from "@o3osatoshi/toolkit";

import { loggerMiddleware, requestIdMiddleware } from "../core/middlewares";

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
 * Errors: domain errors are serialized via {@link toHttpError}.
 *
 * @param deps Implementations of {@link Deps}.
 * @returns Configured Hono app instance.
 */
export function buildApp(deps: Deps) {
  const app = new Hono().basePath("/api");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.get("/healthz", (c) => c.json({ ok: true }));

  app.get("/labs/transactions", async (c) => {
    const userId = c.req.query("userId");
    return await parseGetTransactionsRequest({ userId })
      .asyncAndThen((dto) => {
        const usecase = new GetTransactionsUseCase(deps.transactionRepo);
        return usecase.execute(dto);
      })
      .match(
        (res) => {
          return c.json(res, 200);
        },
        (err) => {
          const { body, status } = toHttpErrorResponse(err);
          return c.json(body, { status });
        },
      );
  });

  return app;
}
