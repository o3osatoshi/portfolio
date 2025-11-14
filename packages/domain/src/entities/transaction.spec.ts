import { describe, expect, it } from "vitest";

import {
  createTransaction,
  newTransaction,
  updateTransaction,
} from "./transaction";

function validNewTx(overrides: Partial<Record<string, unknown>> = {}) {
  const now = new Date();
  return {
    id: "tx-1",
    amount: "1.23",
    createdAt: now,
    currency: "USD",
    datetime: now,
    fee: "0.1",
    feeCurrency: "USD",
    price: "100.5",
    profitLoss: "-10",
    type: "BUY",
    updatedAt: now,
    userId: "user-1",
    ...overrides,
  } as const;
}

describe("entities/transaction", () => {
  it("newTransaction builds a Transaction from raw values", () => {
    const r = newTransaction(validNewTx());
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      const tx = r.value;
      expect(typeof tx.id).toBe("string");
      expect(tx.type).toBe("BUY");
      expect(typeof tx.amount).toBe("string");
      expect(tx.currency).toBe("USD");
      expect(tx.feeCurrency).toBe("USD");
    }
  });

  it("createTransaction builds a CreateTransaction without id/base fields", () => {
    const r = createTransaction({
      amount: "2",
      currency: "JPY",
      datetime: new Date(),
      price: "50",
      type: "BUY",
      userId: "user-1",
    });
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      const tx = r.value;
      expect(tx.type).toBe("BUY");
      expect(tx.currency).toBe("JPY");
      // ensure no id or base fields present
      // @ts-expect-error id is not part of CreateTransaction
      expect(tx.id).toBeUndefined();
      // @ts-expect-error createdAt is not part of CreateTransaction
      expect(tx.createdAt).toBeUndefined();
    }
  });

  it("updateTransaction rejects when id mismatches", () => {
    const base = newTransaction(validNewTx());
    expect(base.isOk()).toBe(true);
    if (!base.isOk()) return;
    const r = updateTransaction(base.value, { id: "tx-2", price: "123" });
    expect(r.isErr()).toBe(true);
    if (r.isErr()) {
      expect(r.error.name).toBe("DomainValidationError");
      expect(r.error.message).toContain("mismatch");
    }
  });

  it("updateTransaction applies partial valid patch", () => {
    const base = newTransaction(validNewTx());
    expect(base.isOk()).toBe(true);
    if (!base.isOk()) return;
    const r = updateTransaction(base.value, {
      id: "tx-1",
      feeCurrency: "JPY",
      price: "200",
      type: "SELL",
    });
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      expect(r.value.type).toBe("SELL");
      expect(r.value.price).toBe("200");
      expect(r.value.feeCurrency).toBe("JPY");
    }
  });

  it("updateTransaction fails when patch contains invalid field", () => {
    const base = newTransaction(validNewTx());
    expect(base.isOk()).toBe(true);
    if (!base.isOk()) return;
    const r = updateTransaction(base.value, { id: "tx-1", amount: "0" });
    expect(r.isErr()).toBe(true);
    if (r.isErr()) expect(r.error.name).toBe("DomainValidationError");
  });
});
