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
