import type { ResultAsync } from "neverthrow";

import { parseWith, type RichError } from "@o3osatoshi/toolkit";

import { requestAuthenticatedApi } from "../../common/http/authenticated-api-request";
import {
  transactionListSchema,
  type TransactionResponse,
  transactionSchema,
} from "./contracts/transaction.schema";

export function createTransaction(
  payload: Record<string, unknown>,
): ResultAsync<TransactionResponse, RichError> {
  return requestAuthenticatedApi("/api/cli/v1/transactions", {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  }).andThen((json) =>
    parseWith(transactionSchema, {
      action: "DecodeCreateTransactionResponse",
      layer: "Presentation",
    })(json),
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
  }).andThen((json) =>
    parseWith(transactionListSchema, {
      action: "DecodeListTransactionsResponse",
      layer: "Presentation",
    })(json),
  );
}

export function updateTransaction(
  id: string,
  payload: Record<string, unknown>,
): ResultAsync<void, RichError> {
  return requestAuthenticatedApi(
    `/api/cli/v1/transactions/${encodeURIComponent(id)}`,
    {
      body: JSON.stringify(payload),
      headers: {
        "content-type": "application/json",
      },
      method: "PATCH",
    },
  ).map(() => undefined);
}
