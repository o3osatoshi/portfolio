import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { deleteTransaction } from "../../lib/api-client";

export async function runTxDelete(
  id: string,
  confirmed: boolean,
): Promise<void> {
  if (!confirmed) {
    const rl = createInterface({ input: stdin, output: stdout });
    try {
      const answer = await rl.question(`Delete transaction ${id}? [y/N] `);
      if (!["y", "yes"].includes(answer.trim().toLowerCase())) {
        console.log("Canceled.");
        return;
      }
    } finally {
      rl.close();
    }
  }

  await deleteTransaction(id);
  console.log("Deleted.");
}
