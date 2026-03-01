import { listTransactions } from "../../lib/api-client";
import type { CliResultAsync } from "../../lib/types";

export function runTxList(asJson: boolean): CliResultAsync<void> {
  return listTransactions().map((rows) => {
    if (asJson) {
      console.log(JSON.stringify(rows, null, 2));
      return undefined;
    }
    console.table(rows);
    return undefined;
  });
}
