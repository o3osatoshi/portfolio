import { err, ok, Result } from "neverthrow";

import { domainValidationError } from "../domain-error";
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
import { type Base, newBase } from "./base";

export type CreateTransaction = Omit<TransactionCore, "id">;

export type CreateTransactionInput = {
  amount: unknown;
  currency: unknown;
  datetime: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
  price: unknown;
  profitLoss?: unknown;
  type: unknown;
  userId: unknown;
};

export type NewTransactionInput = {
  amount: unknown;
  createdAt: unknown;
  currency: unknown;
  datetime: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
  id: unknown;
  price: unknown;
  profitLoss?: unknown;
  type: unknown;
  updatedAt: unknown;
  userId: unknown;
};

export type Transaction = Base & TransactionCore;

export type UpdateTransactionInput = {
  amount?: unknown;
  currency?: unknown;
  datetime?: unknown;
  fee?: unknown;
  feeCurrency?: unknown;
  id: unknown;
  price?: unknown;
  profitLoss?: unknown;
  type?: unknown;
};

interface TransactionCore {
  amount: Amount;
  currency: CurrencyCode;
  datetime: DateTime;
  fee?: Fee | undefined;
  feeCurrency?: CurrencyCode | undefined;
  id: TransactionId;
  price: Price;
  profitLoss?: ProfitLoss | undefined;
  type: TransactionType;
  userId: UserId;
}

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
      amount,
      currency,
      datetime,
      fee,
      feeCurrency,
      price,
      profitLoss,
      type,
      userId,
    }),
  );
}

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
      amount,
      createdAt: base.createdAt,
      currency,
      datetime,
      fee,
      feeCurrency,
      price,
      profitLoss,
      type,
      updatedAt: base.updatedAt,
      userId,
    }),
  );
}

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
