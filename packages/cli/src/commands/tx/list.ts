import { listTransactions } from "../../lib/api-client";

export async function runTxList(asJson: boolean): Promise<void> {
  const rows = await listTransactions();
  if (asJson) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }
  console.table(rows);
}
