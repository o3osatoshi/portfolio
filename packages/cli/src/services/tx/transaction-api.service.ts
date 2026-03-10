import type { ResultAsync } from "neverthrow";

import {
  makeSchemaParser,
  type RichError,
  serialize,
} from "@o3osatoshi/toolkit";

import {
  requestAuthenticatedApi,
  requestAuthenticatedApiWithParser,
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
    requestAuthenticatedApiWithParser(
      "/api/cli/v1/transactions",
      {
        body: serializedPayload,
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      },
      makeSchemaParser(transactionSchema, {
        action: "DecodeCreateTransactionResponse",
        layer: "Presentation",
      }),
    ),
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
  return requestAuthenticatedApiWithParser(
    "/api/cli/v1/transactions",
    {
      method: "GET",
    },
    makeSchemaParser(transactionListSchema, {
      action: "DecodeListTransactionsResponse",
      layer: "Presentation",
    }),
  );
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
