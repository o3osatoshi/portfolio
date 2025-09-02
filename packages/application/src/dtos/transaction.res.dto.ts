import type { Transaction } from "@repo/domain";

export type TransactionResponse = {
  id: string;
  type: "BUY" | "SELL";
  datetime: Date;
  amount: string;
  price: string;
  currency: string;
  profitLoss?: string | undefined;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toTransactionResponse(tx: Transaction): TransactionResponse {
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

export function toTransactionsResponse(
  txs: Transaction[],
): TransactionResponse[] {
  return txs.map(toTransactionResponse);
}

export type GetTransactionsResponse = TransactionResponse[];
export type CreateTransactionResponse = TransactionResponse;
