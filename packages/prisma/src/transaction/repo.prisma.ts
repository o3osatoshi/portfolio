import type { ITransactionRepository } from "@repo/domain";
import type {
  CreateTransaction,
  Transaction,
  UpdateTransaction,
} from "@repo/domain";
import { ResultAsync, errAsync, okAsync } from "neverthrow";
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

export class PrismaTransactionRepository implements ITransactionRepository {
  findById(id: string): ResultAsync<Transaction | null, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findUnique({ where: { id } }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).map((row) => (row ? toEntity(row) : null));
  }

  findByUserId(userId: string): ResultAsync<Transaction[], Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.findMany({ where: { userId } }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).map((rows) => rows.map(toEntity));
  }

  create(tx: CreateTransaction): ResultAsync<void, Error> {
    const data: Prisma.TransactionCreateInput = {
      type: tx.type,
      datetime: tx.datetime,
      amount: tx.amount && new Prisma.Decimal(tx.amount),
      price: tx.price && new Prisma.Decimal(tx.price),
      currency: tx.currency,
      profitLoss: tx.profitLoss && new Prisma.Decimal(tx.profitLoss),
      fee: tx.fee && new Prisma.Decimal(tx.fee),
      feeCurrency: tx.feeCurrency,
      user: {
        connect: { id: tx.userId },
      },
    };
    return ResultAsync.fromPromise(prisma.transaction.create({ data }), (e) =>
      e instanceof Error ? e : new Error("Unknown Error"),
    ).map(() => undefined);
  }

  deleteOwned(id: string, userId: string): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      prisma.transaction.deleteMany({ where: { id, userId } }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).andThen((res) =>
      res.count === 1
        ? okAsync<void>(undefined)
        : errAsync(new Error("Transaction not found or not owned by user.")),
    );
  }

  updateOwned(tx: UpdateTransaction, userId: string): ResultAsync<void, Error> {
    const data: Prisma.TransactionUpdateInput = {
      type: tx.type,
      datetime: tx.datetime,
      amount: tx.amount && new Prisma.Decimal(tx.amount),
      price: tx.price && new Prisma.Decimal(tx.price),
      currency: tx.currency,
      profitLoss: tx.profitLoss && new Prisma.Decimal(tx.profitLoss),
      fee: tx.fee && new Prisma.Decimal(tx.fee),
      feeCurrency: tx.feeCurrency,
      ...(tx.userId !== undefined && {
        user: {
          connect: { id: tx.userId },
        },
      }),
    };
    return ResultAsync.fromPromise(
      prisma.transaction.updateMany({ where: { id: tx.id, userId }, data }),
      (e) => (e instanceof Error ? e : new Error("Unknown Error")),
    ).andThen((res) =>
      res.count === 1
        ? okAsync<void>(undefined)
        : errAsync(new Error("Transaction not found or not owned by user.")),
    );
  }
}
