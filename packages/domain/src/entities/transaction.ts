import { Result, err, ok } from "neverthrow";
import { domainValidationError } from "../domain-error";
import {
  newAmount,
  newCurrencyCode,
  newDateTime,
  newFee,
  newPrice,
  newProfitLoss,
  newTransactionId,
  newTransactionType,
  newUserId,
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
import { type Base, newBase } from "./base";

interface TransactionCore {
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

export type CreateTransaction = Omit<TransactionCore, "id">;

export type Transaction = Base & TransactionCore;

export type NewTransactionInput = {
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

export function newTransaction(
  tx: NewTransactionInput,
): Result<Transaction, Error> {
  return Result.combine([
    newTransactionId(tx.id),
    newTransactionType(tx.type),
    newDateTime(tx.datetime),
    newAmount(tx.amount),
    newPrice(tx.price),
    newCurrencyCode(tx.currency),
    tx.profitLoss ? newProfitLoss(tx.profitLoss) : ok(undefined),
    tx.fee ? newFee(tx.fee) : ok(undefined),
    tx.feeCurrency ? newCurrencyCode(tx.feeCurrency) : ok(undefined),
    newUserId(tx.userId),
    newBase({ createdAt: tx.createdAt, updatedAt: tx.updatedAt }),
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
      base,
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
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
    }),
  );
}

export type CreateTransactionInput = {
  type: unknown;
  datetime: unknown;
  amount: unknown;
  price: unknown;
  currency: unknown;
  profitLoss?: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
  userId: unknown;
};

export function createTransaction(
  tx: CreateTransactionInput,
): Result<CreateTransaction, Error> {
  return Result.combine([
    newTransactionType(tx.type),
    newDateTime(tx.datetime),
    newAmount(tx.amount),
    newPrice(tx.price),
    newCurrencyCode(tx.currency),
    tx.profitLoss ? newProfitLoss(tx.profitLoss) : ok(undefined),
    tx.fee ? newFee(tx.fee) : ok(undefined),
    tx.feeCurrency ? newCurrencyCode(tx.feeCurrency) : ok(undefined),
    newUserId(tx.userId),
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
}

export type UpdateTransactionInput = {
  id: unknown;
  type?: unknown;
  datetime?: unknown;
  amount?: unknown;
  price?: unknown;
  currency?: unknown;
  profitLoss?: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
};

export function updateTransaction(
  tx: Transaction,
  patch: UpdateTransactionInput,
): Result<Transaction, Error> {
  const res = newTransactionId(patch.id);
  if (res.isErr()) return err(res.error);
  const id = res.value;

  if (tx.id !== id) {
    return err(
      domainValidationError({
        action: "UpdateTransaction",
        reason: "Transaction ID mismatch",
      }),
    );
  }

  return Result.combine([
    patch.type ? newTransactionType(patch.type) : ok(undefined),
    patch.datetime ? newDateTime(patch.datetime) : ok(undefined),
    patch.amount ? newAmount(patch.amount) : ok(undefined),
    patch.price ? newPrice(patch.price) : ok(undefined),
    patch.currency ? newCurrencyCode(patch.currency) : ok(undefined),
    patch.profitLoss ? newProfitLoss(patch.profitLoss) : ok(undefined),
    patch.fee ? newFee(patch.fee) : ok(undefined),
    patch.feeCurrency ? newCurrencyCode(patch.feeCurrency) : ok(undefined),
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
    ]) => ({
      ...tx,
      ...(type && { type }),
      ...(datetime && { datetime }),
      ...(amount !== undefined && { amount }),
      ...(price !== undefined && { price }),
      ...(currency && { currency }),
      ...(profitLoss !== undefined && { profitLoss }),
      ...(fee !== undefined && { fee }),
      ...(feeCurrency && { feeCurrency }),
    }),
  );
}
