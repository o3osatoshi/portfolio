import { newTransactionId, updateTransaction } from "@repo/domain";
import type { TransactionRepository } from "@repo/domain";
import { type ResultAsync, err, errAsync, ok } from "neverthrow";
import type { UpdateTransactionDto } from "../../dtos";

export class UpdateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(dto: UpdateTransactionDto, userId: string): ResultAsync<void, Error> {
    const res = newTransactionId(dto.id);
    if (res.isErr()) return errAsync(res.error);
    const id = res.value;

    return this.repo
      .findById(id)
      .andThen((tx) =>
        tx === null ? err(new Error("Transaction not found")) : ok(tx),
      )
      .andThen((tx) =>
        tx.userId !== userId ? err(new Error("Forbidden")) : ok(tx),
      )
      .andThen((tx) => updateTransaction(tx, dto))
      .andThen((updatedTx) => this.repo.update(updatedTx));
  }
}
