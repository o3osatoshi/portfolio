import type { TransactionRepository } from "@repo/domain";
import { newUserId } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import {
  type GetTransactionsRequest,
  type GetTransactionsResponse,
  toTransactionsResponse,
} from "../../dtos";

export class GetTransactionsUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(
    req: GetTransactionsRequest,
  ): ResultAsync<GetTransactionsResponse, Error> {
    const res = newUserId(req.userId);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.findByUserId(res.value).map(toTransactionsResponse);
  }
}
