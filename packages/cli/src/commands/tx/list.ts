import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { listTransactions } from "../../lib/api-client";
import { type OutputMode, printSuccessData } from "../../lib/output";

export function runTxList(
  asJson: boolean,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return listTransactions().map((rows) => {
    printSuccessData("tx.list", rows, outputMode, (data) => {
      const dataRows = data as unknown[];
      if (asJson) {
        console.log(JSON.stringify(dataRows, null, 2));
        return;
      }
      console.table(dataRows);
    });
    return undefined;
  });
}
