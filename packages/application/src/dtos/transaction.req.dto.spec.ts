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
      type: "BUY",
      datetime: new Date("2024-01-02T03:04:05Z"),
      amount: "1.23",
      price: "100.5",
      currency: "USD",
      userId: "user_1",
    });
    expect(res.isOk()).toBe(true);
  });

  it("parseCreateTransactionRequest err on invalid currency", () => {
    const res = parseCreateTransactionRequest({
      type: "BUY",
      datetime: new Date(),
      amount: "1",
      price: "1",
      currency: "usd",
      userId: "u",
    });
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("ApplicationValidationError");
      expect(res.error.message).toContain("currency:");
    }
  });

  it("parseUpdateTransactionRequest ok with partial fields", () => {
    const res = parseUpdateTransactionRequest({ id: "tx_1", price: "10" });
    expect(res.isOk()).toBe(true);
  });

  it("parseGetTransactionsRequest err on empty userId", () => {
    const res = parseGetTransactionsRequest({ userId: "" });
    expect(res.isErr()).toBe(true);
  });

  it("parseDeleteTransactionRequest ok", () => {
    const res = parseDeleteTransactionRequest({ id: "tx_1", userId: "u" });
    expect(res.isOk()).toBe(true);
  });
});
