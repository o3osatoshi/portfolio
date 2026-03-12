import type { TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newApplicationError } from "../../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../../application-error-catalog";
import { DeleteTransactionUseCase } from "./delete-transaction";

const testError = (action: string, reason: string) =>
  newApplicationError({
    code: applicationErrorCodes.INTERNAL,
    details: {
      action,
      reason,
    },
    i18n: { key: applicationErrorI18nKeys.INTERNAL },
    isOperational: false,
    kind: "Internal",
  });

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("CreateTransaction", "not used")),
    delete: () => errAsync(testError("DeleteTransaction", "not implemented")),
    findById: () => errAsync(testError("FindTransactionById", "not used")),
    findByUserId: () =>
      errAsync(testError("FindTransactionsByUserId", "not used")),
    update: () => errAsync(testError("UpdateTransaction", "not used")),
  };
  return { ...base, ...overrides } as TransactionRepository;
}

describe("DeleteTransactionUseCase", () => {
  it("returns ok when repo.delete succeeds", async () => {
    const repo = makeRepo({ delete: () => okAsync<void>(undefined) });
    const usecase = new DeleteTransactionUseCase(repo);
    const res = await usecase.execute({ id: "tx1", userId: "u1" });
    expect(res.isOk()).toBe(true);
  });
});
