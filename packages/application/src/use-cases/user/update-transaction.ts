import { type UpdateTransaction, updateTransaction } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import { type ResultAsync, err, ok } from "neverthrow";

export class UpdateTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(patch: UpdateTransaction, userId: string): ResultAsync<void, Error> {
    return this.repo
      .findById(patch.id)
      .andThen((tx) =>
        tx === null ? err(new Error("Transaction not found")) : ok(tx),
      )
      .andThen((tx) =>
        tx.userId !== userId ? err(new Error("Forbidden")) : ok(tx),
      )
      .andThen((tx) => updateTransaction(tx, patch))
      .andThen((updatedTx) => this.repo.update(updatedTx));
  }
}
