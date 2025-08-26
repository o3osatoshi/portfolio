import { type Transaction, createTransaction } from "@repo/domain";
import type { TransactionRepository } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import type { CreateTransactionDto } from "../../dtos";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(dto: CreateTransactionDto): ResultAsync<Transaction, Error> {
    const res = createTransaction(dto);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value);
  }
}
