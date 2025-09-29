import type { TransactionRepository } from "@repo/domain";
import { newTransactionId, newUserId } from "@repo/domain";
import { errAsync, Result, type ResultAsync } from "neverthrow";

import type { DeleteTransactionRequest } from "../../dtos";

/**
 * Use case encapsulating the deletion of a transaction for a given user.
 */
export class DeleteTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  /**
   * Validate identifiers and delegate deletion to the persistence layer.
   *
   * @param req - Normalized request containing transaction and user identifiers.
   * @returns ResultAsync that resolves when the transaction is removed.
   */
  execute(req: DeleteTransactionRequest): ResultAsync<void, Error> {
    const res = Result.combine([
      newTransactionId(req.id),
      newUserId(req.userId),
    ]);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.delete(...res.value);
  }
}
