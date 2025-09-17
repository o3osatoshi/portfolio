import { newError as baseError } from "@o3osatoshi/toolkit";
import type {
  CreateTransaction,
  Transaction,
  TransactionId,
  TransactionRepository,
  UserId,
} from "@repo/domain";
import { newTransaction } from "@repo/domain";
import { err, ok, Result, ResultAsync } from "neverthrow";

import {
  Prisma,
  type Transaction as PrismaTransaction,
  prisma,
} from "../prisma-client";
import { newPrismaError } from "../prisma-error";

export class PrismaTransactionRepository implements TransactionRepository {
  create(tx: CreateTransaction): ResultAsync<Transaction, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.create({
        data: toCreateData(tx),
      }),
      (e) =>
        newPrismaError({
          action: "CreateTransaction",
          cause: e,
          hint: "Ensure related user exists and data types are valid.",
        }),
    ).andThen(toEntity);
  }

  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.deleteMany({
        where: { id, userId },
      }),
      (e) =>
        newPrismaError({
          action: "DeleteTransaction",
          cause: e,
          hint: "Verify ownership and record existence.",
        }),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(
            baseError({
              action: "DeleteTransaction",
              kind: "NotFound",
              layer: "DB",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }

  findById(id: TransactionId): ResultAsync<null | Transaction, Error> {
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

  update(tx: Transaction): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.updateMany({
        data: toUpdateData(tx),
        where: { id: tx.id, userId: tx.userId },
      }),
      (e) =>
        newPrismaError({
          action: "UpdateTransaction",
          cause: e,
          hint: "Verify ownership and payload schema.",
        }),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(
            baseError({
              action: "UpdateTransaction",
              kind: "NotFound",
              layer: "DB",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }
}

function toCreateData(tx: CreateTransaction): Prisma.TransactionCreateInput {
  return {
    amount: new Prisma.Decimal(tx.amount),
    currency: tx.currency,
    datetime: tx.datetime,
    price: new Prisma.Decimal(tx.price),
    type: tx.type,
    ...(tx.profitLoss ? { profitLoss: new Prisma.Decimal(tx.profitLoss) } : {}),
    ...(tx.fee ? { fee: new Prisma.Decimal(tx.fee) } : {}),
    ...(tx.feeCurrency ? { feeCurrency: tx.feeCurrency } : {}),
    user: {
      connect: { id: tx.userId },
    },
  };
}

function toEntity(tx: PrismaTransaction): Result<Transaction, Error> {
  return newTransaction({
    ...tx,
    amount: tx.amount.toString(),
    fee: tx.fee?.toString(),
    price: tx.price.toString(),
    profitLoss: tx.profitLoss?.toString(),
  });
}

function toUpdateData(
  tx: Transaction,
): Prisma.TransactionUpdateManyMutationInput {
  return {
    amount: new Prisma.Decimal(tx.amount),
    currency: tx.currency,
    datetime: tx.datetime,
    price: new Prisma.Decimal(tx.price),
    type: tx.type,
    ...(tx.profitLoss ? { profitLoss: new Prisma.Decimal(tx.profitLoss) } : {}),
    ...(tx.fee ? { fee: new Prisma.Decimal(tx.fee) } : {}),
    ...(tx.feeCurrency ? { feeCurrency: tx.feeCurrency } : {}),
  };
}
