import {
  type CreateTransaction,
  type ITransactionRepository,
  Transaction,
  type UpdateTransaction,
} from "@repo/domain";
import {
  Prisma,
  type Transaction as PrismaTransaction,
  prisma,
} from "../client";

function toEntity(tx: PrismaTransaction): Transaction {
  return new Transaction({
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
  });
}

export class PrismaTransactionRepository implements ITransactionRepository {
  async findAll(): Promise<Transaction[]> {
    const txs = await prisma.transaction.findMany();
    return txs.map(toEntity);
  }

  async findById(id: string) {
    const tx = await prisma.transaction.findUnique({ where: { id } });
    return tx ? toEntity(tx) : null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const txs = await prisma.transaction.findMany({
      where: { userId },
    });
    return txs.map(toEntity);
  }

  async create(tx: CreateTransaction) {
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
    await prisma.transaction.create({ data });
  }

  async update(tx: UpdateTransaction) {
    const data: Prisma.TransactionUpdateInput = {
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
    await prisma.transaction.update({
      where: { id: tx.id },
      data,
    });
  }

  async delete(id: string) {
    await prisma.transaction.delete({ where: { id } });
  }
}
