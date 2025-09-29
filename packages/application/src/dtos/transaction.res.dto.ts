import type { Transaction } from "@repo/domain";

/**
 * Successful payload returned when a single transaction gets created.
 */
export type CreateTransactionResponse = TransactionResponse;

/**
 * Successful payload returned when listing transactions for a user.
 */
export type GetTransactionsResponse = TransactionResponse[];

/**
 * DTO exposed by the application layer for transaction entities.
 *
 * Dates stay as `Date` to preserve timezone awareness and decimal values remain
 * normalized strings so consumers can choose their own numeric formatting.
 */
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
/**
 * Map a domain {@link Transaction} onto an externally visible DTO.
 */
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
/**
 * Transform a list of domain transactions into DTOs, preserving order.
 */
export function toTransactionsResponse(
  txs: Transaction[],
): TransactionResponse[] {
  return txs.map(toTransactionResponse);
}
