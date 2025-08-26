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
    type: "BUY",
    datetime: now,
    amount: "1.23",
    price: "100.5",
    currency: "USD",
    profitLoss: "-10",
    fee: "0.1",
    feeCurrency: "USD",
    userId: "user-1",
    createdAt: now,
    updatedAt: now,
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
      type: "BUY",
      datetime: new Date(),
      amount: "2",
      price: "50",
      currency: "JPY",
      userId: "user-1",
    });
    expect(r.isOk()).toBe(true);
    if (r.isOk()) {
      const tx = r.value;
      expect(tx.type).toBe("BUY");
      expect(tx.currency).toBe("JPY");
      // ensure no id or base fields present
      // biome-ignore lint/suspicious/noExplicitAny: id is not part of CreateTransaction
      expect((tx as any).id).toBeUndefined();
      // biome-ignore lint/suspicious/noExplicitAny: createdAt is not part of CreateTransaction
      expect((tx as any).createdAt).toBeUndefined();
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
      type: "SELL",
      price: "200",
      feeCurrency: "JPY",
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
