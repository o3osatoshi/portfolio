import type {
  CreateTransaction,
  ITransactionRepository,
  Transaction,
  TransactionId,
  UserId,
} from "@repo/domain";
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
} from "@repo/domain";
import { newError as baseError } from "@repo/toolkit";
import { Result, ResultAsync, err, ok } from "neverthrow";
import {
  Prisma,
  type Transaction as PrismaTransaction,
  prisma,
} from "../prisma-client";
import { newPrismaError } from "../prisma-error";

function toEntity(tx: PrismaTransaction): Result<Transaction, Error> {
  return Result.combine([
    makeTransactionId(tx.id),
    makeTransactionType(tx.type),
    makeDateTime(tx.datetime),
    makeAmount(tx.amount.toString()),
    makePrice(tx.price.toString()),
    makeCurrencyCode(tx.currency),
    tx.profitLoss ? makeProfitLoss(tx.profitLoss.toString()) : ok(undefined),
    tx.fee ? makeFee(tx.fee.toString()) : ok(undefined),
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

function toCreateData(tx: CreateTransaction): Prisma.TransactionCreateInput {
  return {
    type: tx.type,
    datetime: tx.datetime,
    amount: new Prisma.Decimal(tx.amount),
    price: new Prisma.Decimal(tx.price),
    currency: tx.currency,
    profitLoss: tx.profitLoss && new Prisma.Decimal(tx.profitLoss),
    fee: tx.fee && new Prisma.Decimal(tx.fee),
    feeCurrency: tx.feeCurrency,
    user: {
      connect: { id: tx.userId },
    },
  };
}

function toUpdateData(
  tx: Transaction,
): Prisma.TransactionUpdateManyMutationInput {
  return {
    type: tx.type,
    datetime: tx.datetime,
    amount: new Prisma.Decimal(tx.amount),
    price: new Prisma.Decimal(tx.price),
    currency: tx.currency,
    profitLoss: tx.profitLoss && new Prisma.Decimal(tx.profitLoss),
    fee: tx.fee && new Prisma.Decimal(tx.fee),
    feeCurrency: tx.feeCurrency,
  };
}

export class PrismaTransactionRepository implements ITransactionRepository {
  findById(id: TransactionId): ResultAsync<Transaction | null, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findUnique({
        where: { id },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionById",
          cause: e,
        }),
    ).andThen((row) => (row ? toEntity(row) : ok(null)));
  }

  findByUserId(userId: UserId): ResultAsync<Transaction[], Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findMany({
        where: { userId },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionsByUserId",
          cause: e,
        }),
    ).andThen((rows) => Result.combine(rows.map(toEntity)));
  }

  create(tx: CreateTransaction): ResultAsync<Transaction, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.create({
        data: toCreateData(tx),
      }),
      (e) =>
        newPrismaError({
          action: "CreateTransaction",
          hint: "Ensure related user exists and data types are valid.",
          cause: e,
        }),
    ).andThen(toEntity);
  }

  update(tx: Transaction): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.updateMany({
        where: { id: tx.id, userId: tx.userId },
        data: toUpdateData(tx),
      }),
      (e) =>
        newPrismaError({
          action: "UpdateTransaction",
          hint: "Verify ownership and payload schema.",
          cause: e,
        }),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(
            baseError({
              layer: "DB",
              kind: "NotFound",
              action: "UpdateTransaction",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }

  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.deleteMany({
        where: { id, userId },
      }),
      (e) =>
        newPrismaError({
          action: "DeleteTransaction",
          hint: "Verify ownership and record existence.",
          cause: e,
        }),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(
            baseError({
              layer: "DB",
              kind: "NotFound",
              action: "DeleteTransaction",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }
}
