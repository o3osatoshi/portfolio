import type { ITransactionRepository } from "@repo/domain";
import { newTransactionId, newUserId } from "@repo/domain";
import { Result, type ResultAsync, errAsync } from "neverthrow";
import type { DeleteTransactionDto } from "../../dtos";

export class DeleteTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(dto: DeleteTransactionDto): ResultAsync<void, Error> {
    const res = Result.combine([
      newTransactionId(dto.id),
      newUserId(dto.userId),
    ]);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.delete(...res.value);
  }
}
