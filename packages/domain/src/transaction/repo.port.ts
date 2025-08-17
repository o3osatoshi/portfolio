import type {
  CreateTransaction,
  Transaction,
  UpdateTransaction,
} from "./entity";

export interface ITransactionRepository {
  findAll(): Promise<Transaction[]>;
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(tx: CreateTransaction): Promise<void>;
  update(tx: UpdateTransaction): Promise<void>;
  delete(id: string): Promise<void>;
}
