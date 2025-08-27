import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";
import { UpdateTransactionUseCase } from "./update-transaction";

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    findById: () => errAsync(new Error("not implemented")),
    findByUserId: () => errAsync(new Error("not used")),
    create: () => errAsync(new Error("not used")),
    update: () => errAsync(new Error("not implemented")),
    delete: () => errAsync(new Error("not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("UpdateTransactionUseCase", () => {
  it("errors with ApplicationNotFoundError when tx not found", async () => {
    const repo = makeRepo({ findById: () => okAsync(null) });
    const usecase = new UpdateTransactionUseCase(repo);
    const res = await usecase.execute({ id: "tx1" }, "u1");
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("ApplicationNotFoundError");
    }
  });

  it("errors with ApplicationForbiddenError when owner mismatch", async () => {
    const tx = {
      id: "tx1",
      type: "BUY",
      datetime: new Date("2024-01-01T00:00:00Z"),
      amount: "1",
      price: "1",
      currency: "USD",
      userId: "other",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    } as Transaction;
    const repo = makeRepo({ findById: () => okAsync(tx) });
    const usecase = new UpdateTransactionUseCase(repo);
    const res = await usecase.execute({ id: "tx1" }, "u1");
    expect(res.isErr()).toBe(true);
    if (res.isErr()) {
      expect(res.error.name).toBe("ApplicationForbiddenError");
    }
  });

  it("updates when found and owned", async () => {
    const tx = {
      id: "tx1",
      type: "BUY",
      datetime: new Date("2024-01-01T00:00:00Z"),
      amount: "1",
      price: "1",
      currency: "USD",
      userId: "u1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      updatedAt: new Date("2024-01-01T00:00:00Z"),
    } as Transaction;
    const repo = makeRepo({
      findById: () => okAsync(tx),
      update: () => okAsync<void>(undefined),
    });
    const usecase = new UpdateTransactionUseCase(repo);
    const res = await usecase.execute({ id: "tx1", price: "2" }, "u1");
    expect(res.isOk()).toBe(true);
  });
});
