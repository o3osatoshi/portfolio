import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";
import { GetTransactionsUseCase } from "./get-transactions";

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    findById: () => errAsync(new Error("not used")),
    findByUserId: () => errAsync(new Error("not implemented")),
    create: () => errAsync(new Error("not used")),
    update: () => errAsync(new Error("not used")),
    delete: () => errAsync(new Error("not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("GetTransactionsUseCase", () => {
  it("returns ok with mapped list", async () => {
    const tx = {
      id: "tx1",
      type: "SELL",
      datetime: new Date("2024-01-02T00:00:00Z"),
      amount: "2",
      price: "10",
      currency: "USD",
      userId: "u1",
      createdAt: new Date("2024-01-02T00:00:00Z"),
      updatedAt: new Date("2024-01-02T00:00:00Z"),
    } as Transaction;
    const repo = makeRepo({ findByUserId: () => okAsync([tx]) });
    const usecase = new GetTransactionsUseCase(repo);
    const res = await usecase.execute({ userId: "u1" });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value).toHaveLength(1);
      expect(res.value[0]?.id).toBe("tx1");
    }
  });
});
