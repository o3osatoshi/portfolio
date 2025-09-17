import type { ResultAsync } from "neverthrow";

import type { CreateTransaction, Transaction } from "../entities";
import type { TransactionId, UserId } from "../value-objects";

export interface TransactionRepository {
  create(tx: CreateTransaction): ResultAsync<Transaction, Error>;
  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error>;
  findById(id: TransactionId): ResultAsync<null | Transaction, Error>;
  findByUserId(userId: UserId): ResultAsync<Transaction[], Error>;
  update(tx: Transaction): ResultAsync<void, Error>;
}
