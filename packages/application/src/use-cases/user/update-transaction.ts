import type { UpdateTransactionType } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export class UpdateTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(tx: UpdateTransactionType, userId: string): ResultAsync<void, Error> {
    return this.repo.updateOwned(tx, userId);
  }
}
