import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { listTransactions } from "../../lib/api-client";

export function runTxList(asJson: boolean): ResultAsync<void, RichError> {
  return listTransactions().map((rows) => {
    if (asJson) {
      console.log(JSON.stringify(rows, null, 2));
      return undefined;
    }
    console.table(rows);
    return undefined;
  });
}
