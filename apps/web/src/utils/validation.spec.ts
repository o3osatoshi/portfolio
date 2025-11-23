import { describe, expect, it } from "vitest";

import { createTransactionSchema, updateTransactionSchema } from "./validation";

describe("utils/validation createTransactionSchema", () => {
  it("parses valid payload with string fields", () => {
    const now = new Date();
    const input = {
      amount: "1.23",
      currency: "USD",
      datetime: now.toISOString(),
      price: "100.00",
      type: "BUY",
    };

    const res = createTransactionSchema.parse(input);

    expect(res.amount).toBe("1.23");
    expect(res.price).toBe("100.00");
    expect(res.currency).toBe("USD");
    expect(res.type).toBe("BUY");
    expect(res.datetime instanceof Date).toBe(true);
  });

  it("parses valid payload with numeric decimal fields and optionals", () => {
    const now = new Date();
    const input = {
      amount: 1.5,
      currency: "JPY",
      datetime: now,
      fee: 0.1,
      feeCurrency: "JPY",
      price: 10,
      profitLoss: -0.25,
      type: "SELL",
    };

    const res = createTransactionSchema.parse(input);

    expect(res.amount).toBe("1.5");
    expect(res.price).toBe("10");
    expect(res.fee).toBe("0.1");
    expect(res.profitLoss).toBe("-0.25");
    expect(res.feeCurrency).toBe("JPY");
    expect(res.type).toBe("SELL");
    expect(res.datetime instanceof Date).toBe(true);
  });

  it("rejects invalid decimal strings", () => {
    const now = new Date();
    const input = {
      amount: "abc",
      currency: "USD",
      datetime: now.toISOString(),
      price: "100",
      type: "BUY",
    };

    expect(() => createTransactionSchema.parse(input)).toThrow();
  });
});

describe("utils/validation updateTransactionSchema", () => {
  it("parses minimal valid payload with id only", () => {
    const res = updateTransactionSchema.parse({
      id: "tx-1",
    });

    expect(res.id).toBe("tx-1");
  });

  it("parses partial update with numeric fields", () => {
    const now = new Date();
    const res = updateTransactionSchema.parse({
      id: "tx-2",
      amount: 2,
      datetime: now.toISOString(),
      price: 200,
    });

    expect(res.id).toBe("tx-2");
    expect(res.amount).toBe("2");
    expect(res.price).toBe("200");
    expect(res.datetime instanceof Date).toBe(true);
  });

  it("rejects payload without id", () => {
    expect(() =>
      updateTransactionSchema.parse({
        amount: "1.0",
      } as unknown),
    ).toThrow();
  });
});
