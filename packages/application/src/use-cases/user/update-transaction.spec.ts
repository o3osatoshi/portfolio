import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newApplicationError } from "../../application-error";
import { UpdateTransactionUseCase } from "./update-transaction";

const testError = (reason: string) =>
  newApplicationError({
    details: {
      action: "UpdateTransactionUseCaseSpec",
      reason,
    },
    kind: "Unknown",
  });

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("not used")),
    delete: () => errAsync(testError("not used")),
    findById: () => errAsync(testError("not implemented")),
    findByUserId: () => errAsync(testError("not used")),
    update: () => errAsync(testError("not implemented")),
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
      amount: "1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      currency: "USD",
      datetime: new Date("2024-01-01T00:00:00Z"),
      price: "1",
      type: "BUY",
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      userId: "other",
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
      amount: "1",
      createdAt: new Date("2024-01-01T00:00:00Z"),
      currency: "USD",
      datetime: new Date("2024-01-01T00:00:00Z"),
      price: "1",
      type: "BUY",
      updatedAt: new Date("2024-01-01T00:00:00Z"),
      userId: "u1",
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
