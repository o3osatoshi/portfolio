import type { ITransactionRepository } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export class DeleteTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(id: string, userId: string): ResultAsync<void, Error> {
    return this.repo.deleteOwned(id, userId);
  }
}
