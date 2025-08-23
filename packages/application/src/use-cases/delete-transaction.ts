import type { ITransactionRepository } from "@repo/domain";

export class DeleteTransactionUseCase {
  constructor(private readonly repo: ITransactionRepository) {}

  async execute(id: string, userId: string): Promise<void> {
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
