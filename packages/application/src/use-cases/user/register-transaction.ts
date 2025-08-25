import { type Transaction, createTransaction } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import type { CreateTransactionDto } from "../../dtos";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(dto: CreateTransactionDto): ResultAsync<Transaction, Error> {
    const res = createTransaction(dto);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value);
  }
}
