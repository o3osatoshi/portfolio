import { describe, expect, it } from "vitest";

import {
  parseCreateTransactionRequest,
  parseDeleteTransactionRequest,
  parseGetTransactionsRequest,
  parseUpdateTransactionRequest,
} from "./transaction.req.dto";

describe("application/dtos: transaction.req.dto parsers", () => {
  it("parseCreateTransactionRequest ok on valid payload", () => {
    const res = parseCreateTransactionRequest({
      amount: "1.23",
      currency: "USD",
      datetime: new Date("2024-01-02T03:04:05Z"),
      price: "100.5",
      type: "BUY",
      userId: "user_1",
    });
    expect(res.isOk()).toBe(true);
  });

  it("parseCreateTransactionRequest err on invalid currency", () => {
    const res = parseCreateTransactionRequest({
      amount: "1",
      currency: "usd",
      datetime: new Date(),
      price: "1",
      type: "BUY",
      userId: "u",
    });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("ApplicationValidationError");
      expect(res.error.i18n).toEqual({
        key: "errors.application.validation",
      });
      expect(res.error.message).toContain("currency:");
    }
  });

  it("parseUpdateTransactionRequest ok with partial fields", () => {
    const res = parseUpdateTransactionRequest({ id: "tx_1", price: "10" });
    expect(res.isOk()).toBe(true);
  });

  it("parseGetTransactionsRequest err on empty userId", async () => {
    const res = await parseGetTransactionsRequest({ userId: "" });
    expect(res.isErr()).toBe(true);
  });

  it("parseDeleteTransactionRequest ok", () => {
    const res = parseDeleteTransactionRequest({ id: "tx_1", userId: "u" });
    expect(res.isOk()).toBe(true);
  });
});
