import type { Transaction, TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newApplicationError } from "../../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../../application-error-catalog";
import { GetTransactionsUseCase } from "./get-transactions";

const testError = (reason: string) =>
  newApplicationError({
    code: applicationErrorCodes.INTERNAL,
    details: {
      action: "GetTransactionsUseCaseSpec",
      reason,
    },
    i18n: { key: applicationErrorI18nKeys.INTERNAL },
    kind: "Internal",
  });

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("not used")),
    delete: () => errAsync(testError("not used")),
    findById: () => errAsync(testError("not used")),
    findByUserId: () => errAsync(testError("not implemented")),
    update: () => errAsync(testError("not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("GetTransactionsUseCase", () => {
  it("returns ok with mapped list", async () => {
    const tx = {
      id: "tx1",
      amount: "2",
      createdAt: new Date("2024-01-02T00:00:00Z"),
      currency: "USD",
      datetime: new Date("2024-01-02T00:00:00Z"),
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
