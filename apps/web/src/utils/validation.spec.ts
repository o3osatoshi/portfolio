import { describe, expect, it } from "vitest";

import { parseWith } from "@o3osatoshi/toolkit";

import { createTransactionSchema, updateTransactionSchema } from "./validation";

const parseCreateTransaction = parseWith(createTransactionSchema, {
  action: "ParseCreateTransaction",
});
const parseUpdateTransaction = parseWith(updateTransactionSchema, {
  action: "ParseUpdateTransaction",
});

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

    const res = parseCreateTransaction(input);

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.amount).toBe("1.23");
      expect(res.value.price).toBe("100.00");
      expect(res.value.currency).toBe("USD");
      expect(res.value.type).toBe("BUY");
      expect(res.value.datetime instanceof Date).toBe(true);
    }
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

    const res = parseCreateTransaction(input);

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.amount).toBe("1.5");
      expect(res.value.price).toBe("10");
      expect(res.value.fee).toBe("0.1");
      expect(res.value.profitLoss).toBe("-0.25");
      expect(res.value.feeCurrency).toBe("JPY");
      expect(res.value.type).toBe("SELL");
      expect(res.value.datetime instanceof Date).toBe(true);
    }
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

    const res = parseCreateTransaction(input);
    expect(res.isErr()).toBe(true);
  });
});

describe("utils/validation updateTransactionSchema", () => {
  it("parses minimal valid payload with id only", () => {
    const res = parseUpdateTransaction({
      id: "tx-1",
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.id).toBe("tx-1");
    }
  });

  it("parses partial update with numeric fields", () => {
    const now = new Date();
    const res = parseUpdateTransaction({
      id: "tx-2",
      amount: 2,
      datetime: now.toISOString(),
      price: 200,
    });

    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.id).toBe("tx-2");
      expect(res.value.amount).toBe("2");
      expect(res.value.price).toBe("200");
      expect(res.value.datetime instanceof Date).toBe(true);
    }
  });

  it("rejects payload without id", () => {
    const res = parseUpdateTransaction({
      amount: "1.0",
    } as unknown);
    expect(res.isErr()).toBe(true);
  });
});
