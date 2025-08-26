import { createTransaction } from "@repo/domain";
import type { TransactionRepository } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import {
  type CreateTransactionReqDto,
  type CreateTransactionResDto,
  toTransactionResDto,
} from "../../dtos";

export class CreateTransactionUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(
    dto: CreateTransactionReqDto,
  ): ResultAsync<CreateTransactionResDto, Error> {
    const res = createTransaction(dto);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value).map(toTransactionResDto);
  }
}
