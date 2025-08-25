import { Result, err, ok } from "neverthrow";
import { domainValidationError } from "../domain-error";
import {
  makeAmount,
  makeCurrencyCode,
  makeDateTime,
  makeFee,
  makePrice,
  makeProfitLoss,
  makeTransactionId,
  makeTransactionType,
  makeUserId,
} from "../value-objects";
import type {
  Amount,
  CurrencyCode,
  DateTime,
  Fee,
  Price,
  ProfitLoss,
  TransactionId,
  TransactionType,
  UserId,
} from "../value-objects";
import type { Base } from "./base";

interface TransactionDomain {
  id: TransactionId;
  type: TransactionType;
  datetime: DateTime;
  amount: Amount;
  price: Price;
  currency: CurrencyCode;
  profitLoss?: ProfitLoss;
  fee?: Fee;
  feeCurrency?: CurrencyCode;
  userId: UserId;
}

export type CreateTransaction = Omit<TransactionDomain, "id">;
export type UpdateTransaction = Partial<
  Omit<TransactionDomain, "id" | "userId">
> & {
  id: TransactionId;
};

export type Transaction = Base & TransactionDomain;

export type NewTransaction = {
  id: unknown;
  type: unknown;
  datetime: unknown;
  amount: unknown;
  price: unknown;
  currency: unknown;
  profitLoss?: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
  userId: unknown;
  createdAt: unknown;
  updatedAt: unknown;
};

export function newTransaction(tx: NewTransaction): Result<Transaction, Error> {
  return Result.combine([
    makeTransactionId(tx.id),
    makeTransactionType(tx.type),
    makeDateTime(tx.datetime),
    makeAmount(tx.amount),
    makePrice(tx.price),
    makeCurrencyCode(tx.currency),
    tx.profitLoss ? makeProfitLoss(tx.profitLoss) : ok(undefined),
    tx.fee ? makeFee(tx.fee) : ok(undefined),
    tx.feeCurrency ? makeCurrencyCode(tx.feeCurrency) : ok(undefined),
    makeUserId(tx.userId),
    makeDateTime(tx.createdAt),
    makeDateTime(tx.updatedAt),
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
      userId,
      createdAt,
      updatedAt,
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
      userId,
      createdAt,
      updatedAt,
    }),
  );
}

export function updateTransaction(
  transaction: Transaction,
  patch: UpdateTransaction,
): Result<Transaction, Error> {
  if (transaction.id !== patch.id) {
    return err(
      domainValidationError({
        action: "UpdateTransaction",
        reason: "Transaction ID mismatch",
      }),
    );
  }

  return ok({
    ...transaction,
    ...patch,
  });
}
