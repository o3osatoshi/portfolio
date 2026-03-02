import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { listTransactions } from "../../lib/api-client";
import { type OutputMode, printSuccessData } from "../../lib/output";

export function runTxList(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return listTransactions().map((rows) => {
    printSuccessData("tx.list", rows, outputMode, (data) => {
      const dataRows = data as unknown[];
      console.table(dataRows);
    });
    return undefined;
  });
}
