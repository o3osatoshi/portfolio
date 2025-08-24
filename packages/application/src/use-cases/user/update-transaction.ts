import type { UpdateTransactionType } from "@repo/domain";
import type { ITransactionRepository } from "@repo/domain";

export class UpdateTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(tx: UpdateTransactionType, userId: string): Promise<void> {
    const _tx = await this.repo.findById(tx.id);
    if (_tx === null) {
      throw new Error("Transaction not found.");
    }

    if (_tx.userId !== userId) {
      throw new Error("You are not authorized to update this transaction.");
    }

    await this.repo.update(tx);
  }
}
