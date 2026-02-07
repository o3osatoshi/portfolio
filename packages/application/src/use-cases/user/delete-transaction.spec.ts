import type { TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { newApplicationError } from "../../application-error";
import { DeleteTransactionUseCase } from "./delete-transaction";

const testError = (reason: string) =>
  newApplicationError({
    details: {
      action: "DeleteTransactionUseCaseSpec",
      reason,
    },
    kind: "Internal",
  });

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(testError("not used")),
    delete: () => errAsync(testError("not implemented")),
    findById: () => errAsync(testError("not used")),
    findByUserId: () => errAsync(testError("not used")),
    update: () => errAsync(testError("not used")),
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
