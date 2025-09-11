import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";
import { GetTransactionsUseCase } from "./get-transactions";

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(new Error("not used")),
    delete: () => errAsync(new Error("not used")),
    findById: () => errAsync(new Error("not used")),
    findByUserId: () => errAsync(new Error("not implemented")),
    update: () => errAsync(new Error("not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("GetTransactionsUseCase", () => {
  it("returns ok with mapped list", async () => {
    const tx = {
      amount: "2",
      createdAt: new Date("2024-01-02T00:00:00Z"),
      currency: "USD",
      datetime: new Date("2024-01-02T00:00:00Z"),
      id: "tx1",
      price: "10",
      type: "SELL",
      updatedAt: new Date("2024-01-02T00:00:00Z"),
      userId: "u1",
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
