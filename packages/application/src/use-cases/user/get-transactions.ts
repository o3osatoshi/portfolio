import type { TransactionRepository } from "@repo/domain";
import { newUserId } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  toTransactionsResponse,
} from "../../dtos";
import { ensureApplicationErrorI18n } from "../../error-i18n";

/**
 * Use case that fetches all transactions for a given user while enforcing
 * ownership validation.
 */
export class GetTransactionsUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  /**
   * Validate the user identifier and load transactions from the repository.
   *
   * @param req - Normalized request identifying the transaction owner.
   * @returns ResultAsync with a list of DTOs or a structured error.
   */
  execute(
    req: GetTransactionsRequest,
  ): ResultAsync<GetTransactionsResponse, RichError> {
    return newUserId(req.userId)
      .asyncAndThen((userId) =>
        this.repo.findByUserId(userId).map(toTransactionsResponse),
      )
      .mapErr((error) => ensureApplicationErrorI18n(error));
  }
}
