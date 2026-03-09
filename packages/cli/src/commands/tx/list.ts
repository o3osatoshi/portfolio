import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessData } from "../../common/output";
import { listTransactions } from "../../services/tx/transaction-api.service";

export function runTxList(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return listTransactions()
    .andTee((rows) => {
      printSuccessData("tx.list", rows, outputMode, (data) => {
        const dataRows = data as unknown[];
        console.table(dataRows);
      });
    })
    .map(() => undefined);
}
