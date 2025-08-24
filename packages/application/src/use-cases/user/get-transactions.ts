import type { Transaction } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";

export class GetTransactionsUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(userId: string): Promise<Transaction[]> {
    return await this.repo.findByUserId(userId);
  }
}
