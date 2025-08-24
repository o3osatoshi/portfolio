import type { CreateTransaction, Transaction } from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export interface ITransactionRepository {
  findById(id: string): ResultAsync<Transaction | null, Error>;
  findByUserId(userId: string): ResultAsync<Transaction[], Error>;
  create(tx: CreateTransaction): ResultAsync<Transaction, Error>;
  update(tx: Transaction): ResultAsync<void, Error>;
  delete(id: string, userId: string): ResultAsync<void, Error>;
}
