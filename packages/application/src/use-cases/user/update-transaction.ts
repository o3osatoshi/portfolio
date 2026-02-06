import type { TransactionRepository } from "@repo/domain";
import { newTransactionId, updateTransaction } from "@repo/domain";
import { err, ok, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  applicationForbiddenError,
  applicationNotFoundError,
} from "../../application-error";
import type { UpdateTransactionRequest } from "../../dtos";

/**
 * Use case that coordinates ownership checks and domain validation before
 * applying updates to an existing transaction.
 */
export class UpdateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  /**
   * Validate identifiers, ensure ownership, apply domain updates, and persist
   * the patched transaction entity.
   *
   * @param req - Normalized update payload supplied by the application layer.
   * @param userId - Authenticated user identifier used for authorization.
   * @returns ResultAsync that resolves when the transaction is updated.
   */
  execute(
    req: UpdateTransactionRequest,
    userId: string,
  ): ResultAsync<void, RichError> {
    return newTransactionId(req.id).asyncAndThen((id) =>
      this.repo
        .findById(id)
        .andThen((tx) =>
          tx === null
            ? err(
                applicationNotFoundError({
                  details: {
                    action: "UpdateTransaction",
                    reason: "Transaction not found",
                  },
                }),
              )
            : ok(tx),
        )
        .andThen((tx) =>
          tx.userId !== userId
            ? err(
                applicationForbiddenError({
                  details: {
                    action: "UpdateTransaction",
                    reason: "Transaction does not belong to user",
                  },
                }),
              )
            : ok(tx),
        )
        .andThen((tx) => updateTransaction(tx, req))
        .andThen((updatedTx) => this.repo.update(updatedTx)),
    );
  }
}
