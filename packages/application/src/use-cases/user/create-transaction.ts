import type { TransactionRepository } from "@repo/domain";
import { createTransaction } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

import {
  type CreateTransactionRequest,
  type CreateTransactionResponse,
  toTransactionResponse,
} from "../../dtos";

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
  ): ResultAsync<CreateTransactionResponse, Error> {
    const res = createTransaction(req);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value).map(toTransactionResponse);
  }
}
