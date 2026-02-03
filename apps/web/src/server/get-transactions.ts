import "server-only";

import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import type { TransactionResponse } from "@repo/application";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { cacheLife, cacheTag } from "next/cache";

import { env } from "@/env/server";
import { getUserId } from "@/server/auth";
import { getTag } from "@/utils/nav-handler";
import { webUnknownError } from "@/utils/web-error";
import {
  deserializeError,
  type SerializedError,
  serializeError,
} from "@o3osatoshi/toolkit";

export type Transaction = TransactionResponse;

export type Transactions = TransactionResponse[];

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const usecase = new GetTransactionsUseCase(repo);

type CachedTransactionsResult =
  | { data: Transactions; ok: true }
  | { error: SerializedError; ok: false };

export function getTransactions(): ResultAsync<Transactions, Error> {
  return getUserId()
    .andThen((userId) =>
      ResultAsync.fromPromise(getTransactionsCached(userId), (cause) =>
        webUnknownError({
          action: "GetTransactions",
          cause,
          reason: "Failed to read cached transactions.",
        }),
      ),
    )
    .andThen((result) =>
      result.ok
        ? okAsync(result.data)
        : errAsync(deserializeError(result.error)),
    );
}

async function getTransactionsCached(
  userId: string,
): Promise<CachedTransactionsResult> {
  "use cache: private";
  cacheTag(getTag("labs-transactions", { userId }));

  return parseGetTransactionsRequest({ userId })
    .asyncAndThen((req) => usecase.execute(req))
    .match<CachedTransactionsResult>(
      (data) => {
        cacheLife("dataLong");
        return { data, ok: true };
      },
      (error) => {
        cacheLife("errorShort");
        return { error: serializeError(error), ok: false };
      },
    );
}
