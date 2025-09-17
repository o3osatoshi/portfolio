import type { TransactionRepository } from "@repo/domain";
import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

import { DeleteTransactionUseCase } from "./delete-transaction";

function makeRepo(
  overrides: Partial<TransactionRepository> = {},
): TransactionRepository {
  const base: TransactionRepository = {
    create: () => errAsync(new Error("not used")),
    delete: () => errAsync(new Error("not implemented")),
    findById: () => errAsync(new Error("not used")),
    findByUserId: () => errAsync(new Error("not used")),
    update: () => errAsync(new Error("not used")),
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
