import type {
  CreateTransactionType,
  Transaction,
  UpdateTransactionType,
} from "@repo/domain";
import type { ITransactionRepository } from "../interfaces";

export class TransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async findById(id: string): Promise<Transaction | null> {
    return await this.repo.findById(id);
  }

  async find(userId: string | undefined): Promise<Transaction[]> {
    if (userId !== undefined) {
      return await this.repo.findByUserId(userId);
    }

    return await this.repo.findAll();
  }

  async create(tx: CreateTransactionType): Promise<void> {
    await this.repo.create(tx);
  }

  async update(tx: UpdateTransactionType, userId: string): Promise<void> {
    const _tx = await this.repo.findById(tx.id);
    if (_tx === null) {
      throw new Error("Transaction not found.");
    }

    if (_tx.userId !== userId) {
      throw new Error("You are not authorized to update this transaction.");
    }

    await this.repo.update(tx);
  }

  async delete(id: string, userId: string): Promise<void> {
    const _tx = await this.repo.findById(id);
    if (_tx === null) {
      return;
    }

    if (_tx.userId !== userId) {
      throw new Error("You are not authorized to delete this transaction.");
    }

    await this.repo.delete(id);
  }
}
