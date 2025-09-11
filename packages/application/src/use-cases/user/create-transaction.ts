import type { TransactionRepository } from "@repo/domain";
import { createTransaction } from "@repo/domain";
import { errAsync, type ResultAsync } from "neverthrow";
import {
  type CreateTransactionRequest,
  type CreateTransactionResponse,
  toTransactionResponse,
} from "../../dtos";

export class CreateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(
    req: CreateTransactionRequest,
  ): ResultAsync<CreateTransactionResponse, Error> {
    const res = createTransaction(req);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value).map(toTransactionResponse);
  }
}
