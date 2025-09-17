import type { Transaction } from "@repo/domain";

export type CreateTransactionResponse = TransactionResponse;

export type GetTransactionsResponse = TransactionResponse[];

export type TransactionResponse = {
  amount: string;
  createdAt: Date;
  currency: string;
  datetime: Date;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  id: string;
  price: string;
  profitLoss?: string | undefined;
  type: "BUY" | "SELL";
  updatedAt: Date;
  userId: string;
};

export function toTransactionResponse(tx: Transaction): TransactionResponse {
  return {
    id: tx.id,
    amount: tx.amount,
    createdAt: tx.createdAt,
    currency: tx.currency,
    datetime: tx.datetime,
    fee: tx.fee,
    feeCurrency: tx.feeCurrency,
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
