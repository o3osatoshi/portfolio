import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { TransactionRepository } from "@repo/domain";
import { Hono } from "hono";

import { toHttpError } from "../core/errors";
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

  // Labs: Transactions
  app.get("/labs/transactions", async (c) => {
    try {
      const userId = c.req.query("userId");
      if (!userId) return c.json([], 200);

      const usecase = new GetTransactionsUseCase(deps.transactionRepo);
      const result = await parseGetTransactionsRequest({ userId })
        .asyncAndThen((dto) => usecase.execute(dto))
        .match(
          (ok) => ok,
          (e) => {
            throw e;
          },
        );
      return c.json(result, 200);
    } catch (err) {
      const { body, status } = toHttpError(err);
      type ErrorStatus = 400 | 401 | 403 | 404 | 500;
      return c.json(body, status as ErrorStatus);
    }
  });

  return app;
}
