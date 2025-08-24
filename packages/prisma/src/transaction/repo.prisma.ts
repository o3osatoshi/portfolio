import type { ITransactionRepository } from "@repo/domain";
import type { CreateTransaction, Transaction } from "@repo/domain";
import { ResultAsync, err, ok } from "neverthrow";
import {
  Prisma,
  type Transaction as PrismaTransaction,
  prisma,
} from "../client";

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

function toUpdateData(tx: Transaction): Prisma.TransactionUpdateInput {
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

export class PrismaTransactionRepository implements ITransactionRepository {
  findById(id: string): ResultAsync<Transaction | null, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findUnique({
        where: { id },
      }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).map((row) => (row ? toEntity(row) : null));
  }

  findByUserId(userId: string): ResultAsync<Transaction[], Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findMany({
        where: { userId },
      }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).map((rows) => rows.map(toEntity));
  }

  create(tx: CreateTransaction): ResultAsync<Transaction, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.create({
        data: toCreateData(tx),
      }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).map(toEntity);
  }

  update(tx: Transaction): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.updateMany({
        where: { id: tx.id, userId: tx.userId },
        data: toUpdateData(tx),
      }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(new Error("Transaction not found or not owned by user.")),
    );
  }

  delete(id: string, userId: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.deleteMany({
        where: { id, userId },
      }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).andThen((res) =>
      res.count === 1
        ? ok<void>(undefined)
        : err(new Error("Transaction not found or not owned by user.")),
    );
  }
}
