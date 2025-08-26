import type { TransactionRepository } from "@repo/domain";
import { newTransactionId, newUserId } from "@repo/domain";
import { Result, type ResultAsync, errAsync } from "neverthrow";
import type { DeleteTransactionReqDto } from "../../dtos";

export class DeleteTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(dto: DeleteTransactionReqDto): ResultAsync<void, Error> {
    const res = Result.combine([
      newTransactionId(dto.id),
      newUserId(dto.userId),
    ]);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.delete(...res.value);
  }
}
