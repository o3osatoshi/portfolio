import type { Transaction, UserId } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import { makeUserId } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import type { GetTransactionsDto } from "../../dtos";

export class GetTransactionsUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(dto: GetTransactionsDto): ResultAsync<Transaction[], Error> {
    const res = makeUserId(dto.userId);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.findByUserId(res.value);
  }
}
