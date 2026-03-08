import type { ResultAsync } from "neverthrow";

import {
  encode,
  makeSchemaParser,
  type RichError,
  toRichError,
} from "@o3osatoshi/toolkit";

import { requestAuthenticatedApi } from "../../common/http/authenticated-api-request";
import {
  transactionListSchema,
  type TransactionResponse,
  transactionSchema,
} from "./contracts/transaction.schema";

export function createTransaction(
  payload: Record<string, unknown>,
): ResultAsync<TransactionResponse, RichError> {
  return encode(payload)
    .mapErr((cause) =>
      toRichError(cause, {
        details: {
          action: "CreateTransaction",
          reason: "Failed to serialize create transaction payload.",
        },
        isOperational: false,
        kind: "Serialization",
        layer: "Presentation",
      }),
    )
    .asyncAndThen((serializedPayload) =>
      requestAuthenticatedApi("/api/cli/v1/transactions", {
        body: serializedPayload,
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      }),
    )
    .andThen(
      makeSchemaParser(transactionSchema, {
        action: "DecodeCreateTransactionResponse",
        layer: "Presentation",
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
  return requestAuthenticatedApi("/api/cli/v1/transactions", {
    method: "GET",
  }).andThen(
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
  return encode(payload)
    .mapErr((cause) =>
      toRichError(cause, {
        details: {
          action: "UpdateTransaction",
          reason: "Failed to serialize update transaction payload.",
        },
        isOperational: false,
        kind: "Serialization",
        layer: "Presentation",
      }),
    )
    .asyncAndThen((serializedPayload) =>
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
