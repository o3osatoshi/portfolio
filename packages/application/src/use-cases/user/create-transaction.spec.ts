import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newApplicationError } from "../../application-error";
import { applicationErrorCodes } from "../../application-error-catalog";
import { CreateTransactionUseCase } from "./create-transaction";

const testError = (reason: string) =>
  newApplicationError({
    code: applicationErrorCodes.INTERNAL,
    details: {
      action: "CreateTransactionUseCaseSpec",
      reason,
    },
    kind: "Internal",
  });

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("not implemented")),
    delete: () => errAsync(testError("not used")),
    findById: () => errAsync(testError("not used")),
    findByUserId: () => errAsync(testError("not used")),
    update: () => errAsync(testError("not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("CreateTransactionUseCase", () => {
  it("returns ok and maps to response dto", async () => {
    const repo = makeRepo({
      create: () =>
        okAsync({
          id: "tx1",
          amount: "1.0",
          createdAt: new Date("2024-01-01T00:00:00Z"),
          currency: "USD",
          datetime: new Date("2024-01-01T00:00:00Z"),
          price: "99.9",
          type: "BUY",
          updatedAt: new Date("2024-01-01T00:00:00Z"),
          userId: "u1",
        } as Transaction),
    });
    const usecase = new CreateTransactionUseCase(repo);
    const res = await usecase.execute({
      amount: "1.0",
      currency: "USD",
      datetime: new Date("2024-01-01T00:00:00Z"),
      price: "99.9",
      type: "BUY",
      userId: "u1",
    });
    expect(res.isOk()).toBe(true);
    if (res.isOk()) {
      expect(res.value.id).toBe("tx1");
      expect(res.value.currency).toBe("USD");
    }
  });
});
