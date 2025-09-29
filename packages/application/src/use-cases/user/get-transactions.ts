import type { TransactionRepository } from "@repo/domain";
import { newUserId } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";

import {
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  toTransactionsResponse,
} from "../../dtos";

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
  ): ResultAsync<GetTransactionsResponse, Error> {
    const res = newUserId(req.userId);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.findByUserId(res.value).map(toTransactionsResponse);
  }
}
