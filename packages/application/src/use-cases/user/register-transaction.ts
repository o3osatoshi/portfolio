import type { CreateTransactionType } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";

export class RegisterTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(tx: CreateTransactionType): Promise<void> {
    await this.repo.create(tx);
  }
}
