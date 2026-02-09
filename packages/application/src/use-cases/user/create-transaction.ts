import type { TransactionRepository } from "@repo/domain";
import { createTransaction } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import {
  type CreateTransactionRequest,
  type CreateTransactionResponse,
  toTransactionResponse,
} from "../../dtos";
import { ensureApplicationErrorI18n } from "../../error-i18n";

/**
 * Use case responsible for validating and persisting a new transaction for a user.
 */
export class CreateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  /**
   * Validate the inbound request, persist the transaction, and convert the
   * domain entity into a DTO-friendly response.
   *
   * @param req - Normalized request payload from the application layer.
   * @returns ResultAsync wrapping the created transaction DTO or a structured error.
   */
  execute(
    req: CreateTransactionRequest,
  ): ResultAsync<CreateTransactionResponse, RichError> {
    return createTransaction(req)
      .asyncAndThen((transaction) =>
        this.repo.create(transaction).map(toTransactionResponse),
      )
      .mapErr((error) => ensureApplicationErrorI18n(error));
  }
}
