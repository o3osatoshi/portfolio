import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { CreateTransaction, Transaction } from "../entities";
import type { TransactionId, UserId } from "../value-objects";

/**
 * Port describing persistence operations required by transaction use cases.
 */
export interface TransactionRepository {
  /** Persist a newly created transaction and return the stored entity. */
  create(tx: CreateTransaction): ResultAsync<Transaction, RichError>;
  /** Remove a transaction if it belongs to the provided user. */
  delete(id: TransactionId, userId: UserId): ResultAsync<void, RichError>;
  /** Lookup a transaction by its identifier. */
  findById(id: TransactionId): ResultAsync<null | Transaction, RichError>;
  /** List all transactions associated with a user. */
  findByUserId(userId: UserId): ResultAsync<Transaction[], RichError>;
  /** Apply updates to an existing transaction. */
  update(tx: Transaction): ResultAsync<void, RichError>;
}
