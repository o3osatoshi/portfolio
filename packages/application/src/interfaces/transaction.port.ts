import type {
  CreateTransactionType,
  Transaction,
  UpdateTransactionType,
} from "@repo/domain";

export interface ITransactionRepository {
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(tx: CreateTransactionType): Promise<void>;
  update(tx: UpdateTransactionType): Promise<void>;
  delete(id: string): Promise<void>;
}
