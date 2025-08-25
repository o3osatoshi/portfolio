import type { CreateTransaction, Transaction } from "../entities";
import type { TransactionId, UserId } from "../value-objects";
import type { ResultAsync } from "neverthrow";

export interface ITransactionRepository {
  findById(id: TransactionId): ResultAsync<Transaction | null, Error>;
  findByUserId(userId: UserId): ResultAsync<Transaction[], Error>;
  create(tx: CreateTransaction): ResultAsync<Transaction, Error>;
  update(tx: Transaction): ResultAsync<void, Error>;
  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error>;
}
