import type { ITransactionRepository } from "@repo/domain";
import type { CreateTransaction, Transaction } from "@repo/domain";
import { newError as baseError } from "@repo/toolkit";
import { ResultAsync, err, ok } from "neverthrow";
import {
  Prisma,
  type Transaction as PrismaTransaction,
  prisma,
} from "../prisma-client";
import { newPrismaError } from "../prisma-error";

function toEntity(tx: PrismaTransaction): Transaction {
  return {
    id: tx.id,
    type: tx.type,
    datetime: tx.datetime,
    amount: tx.amount.toNumber(),
    price: tx.price.toNumber(),
    currency: tx.currency,
    profitLoss: tx.profitLoss?.toNumber(),
    fee: tx.fee?.toNumber(),
    feeCurrency: tx.feeCurrency ?? undefined,
    userId: tx.userId,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
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
  findById(id: string): ResultAsync<Transaction | null, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findUnique({
        where: { id },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionById",
          cause: e,
        }),
    ).map((row) => (row ? toEntity(row) : null));
  }

  findByUserId(userId: string): ResultAsync<Transaction[], Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findMany({
        where: { userId },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionsByUserId",
          cause: e,
        }),
    ).map((rows) => rows.map(toEntity));
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
    ).map(toEntity);
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

  delete(id: string, userId: string): ResultAsync<void, Error> {
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
