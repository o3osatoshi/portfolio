import { err, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import {
  transactionListSchema,
  transactionSchema,
} from "./contracts/transaction.schema";

const h = vi.hoisted(() => ({
  requestAuthedJsonMock: vi.fn(),
  requestAuthenticatedApiMock: vi.fn(),
}));

vi.mock("../../common/http/authenticated-api-request", () => ({
  requestAuthedJson: (request: {
    body?: string;
    decode?: {
      context: { action: string; layer?: string };
      schema: {
        safeParse: (input: unknown) => { data?: unknown; success: boolean };
      };
    };
    headers?: RequestInit["headers"];
    method?: string;
    path: string;
  }) =>
    h.requestAuthedJsonMock(request).andThen((json: unknown) => {
      if (!request.decode) {
        return ok(json);
      }

      const result = request.decode.schema.safeParse(json);
      if (result.success) {
        return ok(result.data);
      }

      return err(
        newRichError({
          code: "CLI_COMMAND_INVALID_ARGUMENT",
          details: {
            action: request.decode.context.action,
            reason: "Schema parsing failed.",
          },
          isOperational: true,
          kind: "Validation",
          layer: "Presentation",
        }),
      );
    }),
  requestAuthenticatedApi: h.requestAuthenticatedApiMock,
}));

describe("services/tx/transaction-api.service", () => {
  beforeEach(() => {
    h.requestAuthedJsonMock.mockReset();
    h.requestAuthenticatedApiMock.mockReset();
  });

  it("creates transaction and returns parsed response", async () => {
    h.requestAuthedJsonMock.mockReturnValueOnce(
      okAsync({
        id: "tx-1",
        amount: "1",
        createdAt: "2026-01-01T00:00:00.000Z",
        currency: "USD",
        datetime: "2026-01-01T00:00:00.000Z",
        fee: "0.25",
        feeCurrency: "USD",
        price: "100",
        profitLoss: "-10",
        type: "BUY",
        updatedAt: "2026-01-01T00:00:00.000Z",
        userId: "user-1",
      }),
    );

    const { createTransaction } = await import("./transaction-api.service");
    const result = await createTransaction({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
    });

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value.fee).toBe("0.25");
    expect(result.value.feeCurrency).toBe("USD");
    expect(result.value.profitLoss).toBe("-10");
    expect(h.requestAuthedJsonMock).toHaveBeenCalledWith({
      body: JSON.stringify({
        amount: "1",
        currency: "USD",
        datetime: "2026-01-01T00:00:00.000Z",
        price: "100",
        type: "BUY",
      }),
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
    });
  });

  it("preserves optional transaction fields when listing transactions", async () => {
    h.requestAuthedJsonMock.mockReturnValueOnce(
      okAsync([
        {
          id: "tx-1",
          amount: "1",
          createdAt: "2026-01-01T00:00:00.000Z",
          currency: "USD",
          datetime: "2026-01-01T00:00:00.000Z",
          fee: "0.1",
          feeCurrency: "USD",
          price: "100",
          profitLoss: "1.5",
          type: "BUY",
          updatedAt: "2026-01-01T00:00:00.000Z",
          userId: "user-1",
        },
      ]),
    );

    const { listTransactions } = await import("./transaction-api.service");
    const result = await listTransactions();

    expect(result.isOk()).toBe(true);
    if (result.isErr()) throw new Error("Expected ok result");
    expect(result.value[0]?.fee).toBe("0.1");
    expect(result.value[0]?.feeCurrency).toBe("USD");
    expect(result.value[0]?.profitLoss).toBe("1.5");
    expect(h.requestAuthedJsonMock).toHaveBeenCalledWith({
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
  });

  it("encodes transaction id for update and delete", async () => {
    h.requestAuthenticatedApiMock.mockReturnValue(okAsync());

    const { deleteTransaction, updateTransaction } = await import(
      "./transaction-api.service"
    );

    const updateResult = await updateTransaction("tx id/1", { amount: "2" });
    expect(updateResult.isOk()).toBe(true);
    expect(h.requestAuthenticatedApiMock).toHaveBeenNthCalledWith(
      1,
      "/api/cli/v1/transactions/tx%20id%2F1",
      {
        body: JSON.stringify({ amount: "2" }),
        headers: {
          "content-type": "application/json",
        },
        method: "PATCH",
      },
    );

    const deleteResult = await deleteTransaction("tx id/1");
    expect(deleteResult.isOk()).toBe(true);
    expect(h.requestAuthenticatedApiMock).toHaveBeenNthCalledWith(
      2,
      "/api/cli/v1/transactions/tx%20id%2F1",
      {
        method: "DELETE",
      },
    );
  });

  it("returns validation error when transaction payload is invalid", async () => {
    h.requestAuthedJsonMock.mockReturnValueOnce(okAsync({ id: "tx-1" }));

    const { createTransaction } = await import("./transaction-api.service");
    const result = await createTransaction({
      amount: "1",
      currency: "USD",
      datetime: "2026-01-01T00:00:00.000Z",
      price: "100",
      type: "BUY",
    });

    expect(result.isErr()).toBe(true);
    if (result.isOk()) throw new Error("Expected err result");
    expect(result.error.kind).toBe("Validation");
  });
});
