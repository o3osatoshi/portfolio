import type {
  CreateTransaction,
  Transaction,
  TransactionId,
  TransactionRepository,
  UserId,
} from "@repo/domain";
import { newTransaction } from "@repo/domain";
import { err, ok, Result, ResultAsync } from "neverthrow";

import { newError } from "@o3osatoshi/toolkit";

import {
  Prisma,
  type PrismaClient,
  type Transaction as PrismaTransaction,
} from "../prisma-client";
import { newPrismaError } from "../prisma-error";

/**
 * Prisma-backed implementation of the {@link TransactionRepository} port.
 * Maps domain value objects to Prisma primitives and normalizes errors.
 */
export class PrismaTransactionRepository implements TransactionRepository {
  constructor(private readonly db: Prisma.TransactionClient | PrismaClient) {}

  /** @inheritdoc */
  create(tx: CreateTransaction): ResultAsync<Transaction, Error> {
    return ResultAsync.fromPromise(
      this.db.transaction.create({
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

  /** @inheritdoc */
  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      this.db.transaction.deleteMany({
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
            newError({
              action: "DeleteTransaction",
              kind: "NotFound",
              layer: "DB",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }

  /** @inheritdoc */
  findById(id: TransactionId): ResultAsync<null | Transaction, Error> {
    return ResultAsync.fromPromise(
      this.db.transaction.findUnique({
        where: { id },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionById",
          cause: e,
        }),
    ).andThen((row) => (row ? toEntity(row) : ok(null)));
  }

  /** @inheritdoc */
  findByUserId(userId: UserId): ResultAsync<Transaction[], Error> {
    return ResultAsync.fromPromise(
      this.db.transaction.findMany({
        where: { userId },
      }),
      (e) =>
        newPrismaError({
          action: "FindTransactionsByUserId",
          cause: e,
        }),
    ).andThen((rows) => Result.combine(rows.map(toEntity)));
  }

  /** @inheritdoc */
  update(tx: Transaction): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      this.db.transaction.updateMany({
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
            newError({
              action: "UpdateTransaction",
              kind: "NotFound",
              layer: "DB",
              reason: "Transaction not found or not owned by user.",
            }),
          ),
    );
  }
}

/** Convert validated domain data into a Prisma create payload. */
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

/**
 * Transform a Prisma row into a domain {@link Transaction} by normalizing
 * decimal values into strings expected by the value objects.
 */
function toEntity(tx: PrismaTransaction): Result<Transaction, Error> {
  return newTransaction({
    ...tx,
    amount: tx.amount.toString(),
    fee: tx.fee?.toString(),
    price: tx.price.toString(),
    profitLoss: tx.profitLoss?.toString(),
  });
}

/** Convert a domain transaction into a Prisma update payload. */
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
