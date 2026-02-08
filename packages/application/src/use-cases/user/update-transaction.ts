import type { TransactionRepository } from "@repo/domain";
import { newTransactionId, updateTransaction } from "@repo/domain";
import { err, ok, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  applicationForbiddenError,
  applicationNotFoundError,
} from "../../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../../application-error-catalog";
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
                  code: applicationErrorCodes.TRANSACTION_NOT_FOUND,
                  details: {
                    action: "UpdateTransaction",
                    reason: "Transaction not found",
                  },
                  i18n: {
                    key: applicationErrorI18nKeys.NOT_FOUND,
                  },
                }),
              )
            : ok(tx),
        )
        .andThen((tx) =>
          tx.userId !== userId
            ? err(
                applicationForbiddenError({
                  code: applicationErrorCodes.TRANSACTION_UPDATE_FORBIDDEN,
                  details: {
                    action: "UpdateTransaction",
                    reason: "Transaction does not belong to user",
                  },
                  i18n: {
                    key: applicationErrorI18nKeys.FORBIDDEN,
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
