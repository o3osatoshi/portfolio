import { describe, expect, it } from "vitest";
import {
  parseCreateTransactionReqDto,
  parseUpdateTransactionReqDto,
  parseGetTransactionsReqDto,
  parseDeleteTransactionReqDto,
} from "./transaction.req.dto";

describe("application/dtos: transaction.req.dto parsers", () => {
  it("parseCreateTransactionReqDto ok on valid payload", () => {
    const res = parseCreateTransactionReqDto({
      type: "BUY",
      datetime: new Date("2024-01-02T03:04:05Z"),
      amount: "1.23",
      price: "100.5",
      currency: "USD",
      userId: "user_1",
    });
    expect(res.isOk()).toBe(true);
  });

  it("parseCreateTransactionReqDto err on invalid currency", () => {
    const res = parseCreateTransactionReqDto({
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

  it("parseUpdateTransactionReqDto ok with partial fields", () => {
    const res = parseUpdateTransactionReqDto({ id: "tx_1", price: "10" });
    expect(res.isOk()).toBe(true);
  });

  it("parseGetTransactionsReqDto err on empty userId", () => {
    const res = parseGetTransactionsReqDto({ userId: "" });
    expect(res.isErr()).toBe(true);
  });

  it("parseDeleteTransactionReqDto ok", () => {
    const res = parseDeleteTransactionReqDto({ id: "tx_1", userId: "u" });
    expect(res.isOk()).toBe(true);
  });
});

