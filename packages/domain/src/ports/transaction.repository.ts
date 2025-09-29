import type { ResultAsync } from "neverthrow";

import type { CreateTransaction, Transaction } from "../entities";
import type { TransactionId, UserId } from "../value-objects";

/**
 * Port describing persistence operations required by transaction use cases.
 */
export interface TransactionRepository {
  /** Persist a newly created transaction and return the stored entity. */
  create(tx: CreateTransaction): ResultAsync<Transaction, Error>;
  /** Remove a transaction if it belongs to the provided user. */
  delete(id: TransactionId, userId: UserId): ResultAsync<void, Error>;
  /** Lookup a transaction by its identifier. */
  findById(id: TransactionId): ResultAsync<null | Transaction, Error>;
  /** List all transactions associated with a user. */
  findByUserId(userId: UserId): ResultAsync<Transaction[], Error>;
  /** Apply updates to an existing transaction. */
  update(tx: Transaction): ResultAsync<void, Error>;
}
