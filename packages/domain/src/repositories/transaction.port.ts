import type {
  CreateTransactionType,
  Transaction,
  UpdateTransactionType,
} from "@repo/domain";
import type { ResultAsync } from "neverthrow";

export interface ITransactionRepository {
  findById(id: string): ResultAsync<Transaction | null, Error>;
  findByUserId(userId: string): ResultAsync<Transaction[], Error>;
  create(tx: CreateTransactionType): ResultAsync<void, Error>;
  deleteOwned(id: string, userId: string): ResultAsync<void, Error>;
  updateOwned(
    tx: UpdateTransactionType,
    userId: string,
  ): ResultAsync<void, Error>;
}
