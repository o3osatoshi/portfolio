import type {
  CreateTransactionType,
  Transaction,
  UpdateTransactionType,
} from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export interface ITransactionRepository {
  findAll(): ResultAsync<Transaction[], Error>;
  findById(id: string): ResultAsync<Transaction | null, Error>;
  findByUserId(userId: string): ResultAsync<Transaction[], Error>;
  create(tx: CreateTransactionType): ResultAsync<void, Error>;
  update(tx: UpdateTransactionType): ResultAsync<void, Error>;
  delete(id: string): ResultAsync<void, Error>;
  deleteOwned(id: string, userId: string): ResultAsync<void, Error>;
  updateOwned(tx: UpdateTransactionType, userId: string): ResultAsync<void, Error>;
}
