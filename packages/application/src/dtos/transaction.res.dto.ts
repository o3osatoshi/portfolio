import type { Transaction } from "@repo/domain";

export type TransactionResDto = {
  id: string;
  type: "BUY" | "SELL";
  datetime: Date;
  amount: string;
  price: string;
  currency: string;
  profitLoss?: string;
  fee?: string;
  feeCurrency?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toTransactionResDto(tx: Transaction): TransactionResDto {
  return {
    id: tx.id,
    type: tx.type,
    datetime: tx.datetime,
    amount: tx.amount,
    price: tx.price,
    currency: tx.currency,
    profitLoss: tx.profitLoss,
    fee: tx.fee,
    feeCurrency: tx.feeCurrency,
    userId: tx.userId,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}

export function toTransactionsResDto(txs: Transaction[]): TransactionResDto[] {
  return txs.map(toTransactionResDto);
}

export type GetTransactionsResDto = TransactionResDto[];
export type CreateTransactionResDto = TransactionResDto;
