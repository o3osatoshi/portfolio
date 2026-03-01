import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { okAsync, ResultAsync } from "neverthrow";

import { newRichError } from "@o3osatoshi/toolkit";

import { deleteTransaction } from "../../lib/api-client";
import { cliErrorCodes } from "../../lib/cli-error-catalog";
import type { CliResultAsync } from "../../lib/types";

export function runTxDelete(
  id: string,
  confirmed: boolean,
): CliResultAsync<void> {
  if (confirmed) {
    return deleteTransaction(id).map(() => {
      console.log("Deleted.");
      return undefined;
    });
  }

  return ResultAsync.fromPromise(
    (async () => {
      const rl = createInterface({ input: stdin, output: stdout });
      try {
        return await rl.question(`Delete transaction ${id}? [y/N] `);
      } finally {
        rl.close();
      }
    })(),
    (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_API_REQUEST_FAILED,
        details: {
          action: "ConfirmDeleteTransaction",
          reason: "Failed to read confirmation input.",
        },
        isOperational: true,
        kind: "Internal",
        layer: "Presentation",
      }),
  ).andThen((answer) => {
    if (!["y", "yes"].includes(answer.trim().toLowerCase())) {
      console.log("Canceled.");
      return okAsync(undefined);
    }

    return deleteTransaction(id).map(() => {
      console.log("Deleted.");
      return undefined;
    });
  });
}
