import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { GetTransactionsResponse } from "@repo/application";
import { getAuthUserId } from "@repo/auth";
import { verifyAuth } from "@repo/auth/middleware";
import { Hono } from "hono";

import { respondAsync } from "../../core";
import { userIdMiddleware } from "../../core";
import type { ContextEnv } from "../../core/types";
import type { Deps } from "../app";

export function buildPrivateRoutes(deps: Deps) {
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
