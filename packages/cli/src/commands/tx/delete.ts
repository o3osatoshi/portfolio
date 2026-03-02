import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { errAsync, okAsync, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { deleteTransaction } from "../../lib/api-client";
import { cliErrorCodes } from "../../lib/cli-error-catalog";
import { type OutputMode, printSuccessMessage } from "../../lib/output";

export function runTxDelete(
  id: string,
  confirmed: boolean,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  if (outputMode === "json" && !confirmed) {
    return errAsync(
      newRichError({
        code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
        details: {
          action: "ConfirmDeleteTransaction",
          reason: "tx delete requires --yes when --output json is used.",
        },
        isOperational: true,
        kind: "Validation",
        layer: "Presentation",
      }),
    );
  }

  if (!confirmed && !isInteractiveTerminal()) {
    return errAsync(
      newRichError({
        code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
        details: {
          action: "ConfirmDeleteTransaction",
          reason: "tx delete requires --yes in non-interactive mode.",
        },
        isOperational: true,
        kind: "Validation",
        layer: "Presentation",
      }),
    );
  }

  if (confirmed) {
    return deleteTransaction(id).map(() => {
      printSuccessMessage("tx.delete", "Deleted.", outputMode);
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
      printSuccessMessage("tx.delete", "Canceled.", outputMode);
      return okAsync(undefined);
    }

    return deleteTransaction(id).map(() => {
      printSuccessMessage("tx.delete", "Deleted.", outputMode);
      return undefined;
    });
  });
}

function isInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stdout.isTTY === true;
}
