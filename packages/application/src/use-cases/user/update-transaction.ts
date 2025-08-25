import {
  makeAmount,
  makeCurrencyCode,
  makeDateTime,
  makeFee,
  makePrice,
  makeProfitLoss,
  makeTransactionId,
  makeTransactionType,
  updateTransaction,
} from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";
import { Result, type ResultAsync, err, errAsync, ok } from "neverthrow";
import type { UpdateTransactionDto } from "../../dtos";

export class UpdateTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  execute(dto: UpdateTransactionDto, userId: string): ResultAsync<void, Error> {
    const res = Result.combine([
      makeTransactionId(dto.id),
      dto.type ? makeTransactionType(dto.type) : ok(undefined),
      dto.datetime ? makeDateTime(dto.datetime) : ok(undefined),
      dto.amount ? makeAmount(dto.amount.toString()) : ok(undefined),
      dto.price ? makePrice(dto.price.toString()) : ok(undefined),
      dto.currency ? makeCurrencyCode(dto.currency) : ok(undefined),
      dto.profitLoss
        ? makeProfitLoss(dto.profitLoss.toString())
        : ok(undefined),
      dto.fee ? makeFee(dto.fee.toString()) : ok(undefined),
      dto.feeCurrency ? makeCurrencyCode(dto.feeCurrency) : ok(undefined),
    ]).map(
      ([
        id,
        type,
        datetime,
        amount,
        price,
        currency,
        profitLoss,
        fee,
        feeCurrency,
      ]) => ({
        id,
        type,
        datetime,
        amount,
        price,
        currency,
        profitLoss,
        fee,
        feeCurrency,
      }),
    );
    if (res.isErr()) return errAsync(res.error);
    const patch = res.value;

    return this.repo
      .findById(patch.id)
      .andThen((tx) =>
        tx === null ? err(new Error("Transaction not found")) : ok(tx),
      )
      .andThen((tx) =>
        tx.userId !== userId ? err(new Error("Forbidden")) : ok(tx),
      )
      .andThen((tx) => updateTransaction(tx, patch))
      .andThen((updatedTx) => this.repo.update(updatedTx));
  }
}
