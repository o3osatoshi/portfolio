import type {
  CreateTransaction,
  Transaction,
  UpdateTransaction,
} from "./entity";
import type { ITransactionRepository } from "./repo.port";

export class TransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async findAll(): Promise<Transaction[]> {
    return await this.repo.findAll();
  }

  async create(tx: CreateTransaction): Promise<void> {
    await this.repo.create(tx);
  }

  async update(tx: UpdateTransaction): Promise<void> {
    await this.repo.update(tx);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
