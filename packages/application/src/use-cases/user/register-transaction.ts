import type { CreateTransactionType } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(tx: CreateTransactionType): ResultAsync<void, Error> {
    return this.repo.create(tx);
  }
}
