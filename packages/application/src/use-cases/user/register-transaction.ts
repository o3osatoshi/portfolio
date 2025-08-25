import {
  type Transaction,
  makeAmount,
  makeCurrencyCode,
  makeDateTime,
  makePrice,
  makeTransactionType,
  makeUserId,
} from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import { Result, type ResultAsync, errAsync, ok } from "neverthrow";
import type { CreateTransactionDto } from "../../dtos";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(dto: CreateTransactionDto): ResultAsync<Transaction, Error> {
    const res = Result.combine([
      makeTransactionType(dto.type),
      makeDateTime(dto.datetime),
      makeAmount(dto.amount),
      makePrice(dto.price),
      makeCurrencyCode(dto.currency),
      dto.profitLoss ? makeAmount(dto.profitLoss) : ok(undefined),
      dto.fee ? makeAmount(dto.fee) : ok(undefined),
      dto.feeCurrency ? makeCurrencyCode(dto.feeCurrency) : ok(undefined),
      makeUserId(dto.userId),
    ]).map(
      ([
        type,
        datetime,
        amount,
        price,
        currency,
        profitLoss,
        fee,
        feeCurrency,
        userId,
      ]) => ({
        type,
        datetime,
        amount,
        price,
        currency,
        profitLoss,
        fee,
        feeCurrency,
        userId,
      }),
    );
    if (res.isErr()) return errAsync(res.error);

    return this.repo.create(res.value);
  }
}
