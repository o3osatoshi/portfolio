import { type Result, err, ok } from "neverthrow";
import { domainValidationError } from "../domain-error";
import type { Base } from "./base";
import type { 
  Amount, 
  Price, 
  ProfitLoss, 
  Fee, 
  TransactionId, 
  UserId, 
  CurrencyCode, 
  TransactionType, 
  DateTime 
} from "../value-objects";

interface TransactionDomain {
  id: TransactionId;
  type: TransactionType;
  datetime: DateTime;
  amount: Amount;
  price: Price;
  currency: CurrencyCode;
  profitLoss?: ProfitLoss;
  fee?: Fee;
  feeCurrency?: CurrencyCode;
  userId: UserId;
}

export type CreateTransaction = Omit<TransactionDomain, "id">;
export type UpdateTransaction = Partial<Omit<TransactionDomain, "id" | "userId">> & {
  id: TransactionId;
};

export type Transaction = Base & TransactionDomain;

export function updateTransaction(
  transaction: Transaction,
  patch: UpdateTransaction,
): Result<Transaction, Error> {
  if (transaction.id !== patch.id) {
    return err(
      domainValidationError({
        action: "UpdateTransaction",
        reason: "Transaction ID mismatch",
      }),
    );
  }

  return ok({
    ...transaction,
    ...patch,
  });
}
