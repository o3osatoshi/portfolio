import type { TransactionRepository } from "@repo/domain";
import { newTransactionId, newUserId } from "@repo/domain";
import { errAsync, Result, type ResultAsync } from "neverthrow";
import type { DeleteTransactionRequest } from "../../dtos";

export class DeleteTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(req: DeleteTransactionRequest): ResultAsync<void, Error> {
    const res = Result.combine([
      newTransactionId(req.id),
      newUserId(req.userId),
    ]);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.delete(...res.value);
  }
}
