import type { Transaction } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export class GetTransactionsUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(userId: string): ResultAsync<Transaction[], Error> {
    return this.repo.findByUserId(userId);
  }
}
