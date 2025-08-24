import type { CreateTransaction, Transaction } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(tx: CreateTransaction): ResultAsync<Transaction, Error> {
    return this.repo.create(tx);
  }
}
