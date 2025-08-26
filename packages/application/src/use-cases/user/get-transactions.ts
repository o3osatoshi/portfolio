import type { TransactionRepository } from "@repo/domain";
import { newUserId } from "@repo/domain";
import { type ResultAsync, errAsync } from "neverthrow";
import {
  type GetTransactionsReqDto,
  type GetTransactionsResDto,
  toTransactionsResDto,
} from "../../dtos";

export class GetTransactionsUseCase {
  constructor(private readonly repo: TransactionRepository) {}

  execute(
    dto: GetTransactionsReqDto,
  ): ResultAsync<GetTransactionsResDto, Error> {
    const res = newUserId(dto.userId);
    if (res.isErr()) return errAsync(res.error);

    return this.repo.findByUserId(res.value).map(toTransactionsResDto);
  }
}
