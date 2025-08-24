import { type Result, err, ok } from "neverthrow";
import type { Base } from "./base";

interface TransactionDomain {
  type: string;
  datetime: Date;
  amount: number;
  price: number;
  currency: string;
  profitLoss?: number;
  fee?: number;
  feeCurrency?: string;
  userId: string;
}

export type CreateTransaction = TransactionDomain;
export type UpdateTransaction = Partial<TransactionDomain> &
  Required<Pick<Base, "id">>;

export type Transaction = Base & TransactionDomain;

export function updateTransaction(
  transaction: Transaction,
  patch: UpdateTransaction,
): Result<Transaction, Error> {
  if (transaction.id !== patch.id) {
    return err(new Error("Transaction ID mismatch"));
  }
  if (patch.userId && transaction.userId !== patch.userId) {
    return err(new Error("Cannot change userId of the transaction"));
  }

  return ok({
    ...transaction,
    ...patch,
  });
}
