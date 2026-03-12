import type { ResultAsync } from "neverthrow";

import { type RichError, serialize } from "@o3osatoshi/toolkit";

import {
  fetchAuthedJson,
  fetchAuthenticatedApi,
} from "../../common/http/authenticated-api-fetch";
import {
  transactionListSchema,
  type TransactionResponse,
  transactionSchema,
} from "./contracts/transaction.schema";

export function createTransaction(
  payload: Record<string, unknown>,
): ResultAsync<TransactionResponse, RichError> {
  return serialize(payload).asyncAndThen((serializedPayload) =>
    fetchAuthedJson({
      body: serializedPayload,
      decode: {
        context: {
          action: "DecodeCreateTransactionResponse",
          layer: "Presentation",
        },
        schema: transactionSchema,
      },
      headers: {
        "content-type": "application/json",
      },
      method: "POST",
      path: "/api/cli/v1/transactions",
    }),
  );
}

export function deleteTransaction(id: string): ResultAsync<void, RichError> {
  return fetchAuthenticatedApi(
    `/api/cli/v1/transactions/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  ).map(() => undefined);
}

export function listTransactions(): ResultAsync<
  TransactionResponse[],
  RichError
> {
  return fetchAuthedJson({
    decode: {
      context: {
        action: "DecodeListTransactionsResponse",
        layer: "Presentation",
      },
      schema: transactionListSchema,
    },
    method: "GET",
    path: "/api/cli/v1/transactions",
  });
}

export function updateTransaction(
  id: string,
  payload: Record<string, unknown>,
): ResultAsync<void, RichError> {
  return serialize(payload).asyncAndThen((serializedPayload) =>
    fetchAuthenticatedApi(
      `/api/cli/v1/transactions/${encodeURIComponent(id)}`,
      {
        body: serializedPayload,
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      },
    ).map(() => undefined),
  );
}
