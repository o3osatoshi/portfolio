import type { ResultAsync } from "neverthrow";

import { type RichError, serialize } from "@o3osatoshi/toolkit";

import {
  requestAuthedJson,
  requestAuthenticatedApi,
} from "../../common/http/authenticated-api-request";
import {
  transactionListSchema,
  type TransactionResponse,
  transactionSchema,
} from "./contracts/transaction.schema";

export function createTransaction(
  payload: Record<string, unknown>,
): ResultAsync<TransactionResponse, RichError> {
  return serialize(payload).asyncAndThen((serializedPayload) =>
    requestAuthedJson({
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
  return requestAuthenticatedApi(
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
  return requestAuthedJson({
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
    requestAuthenticatedApi(
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
