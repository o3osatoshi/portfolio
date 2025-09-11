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
    amount: tx.amount,
    createdAt: tx.createdAt,
    currency: tx.currency,
    datetime: tx.datetime,
    fee: tx.fee,
    feeCurrency: tx.feeCurrency,
    id: tx.id,
    price: tx.price,
    profitLoss: tx.profitLoss,
    type: tx.type,
    updatedAt: tx.updatedAt,
    userId: tx.userId,
  };
}

export function toTransactionsResponse(
  txs: Transaction[],
): TransactionResponse[] {
  return txs.map(toTransactionResponse);
}

export type GetTransactionsResponse = TransactionResponse[];
export type CreateTransactionResponse = TransactionResponse;
