import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { type OutputMode, printSuccessMessage } from "../../common/output";
import { makeCliSchemaParser } from "../../common/zod-validation";
import { deleteTransaction } from "../../services/tx/transaction-api.service";

const txDeleteArgsSchema = z.object({
  id: z.string().trim().min(1),
});

export function runTxDelete(
  id: string,
  confirmed: boolean,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const parsedArgs = makeCliSchemaParser(txDeleteArgsSchema, {
    action: "ParseTxDeleteArguments",
    code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
    context: "tx delete arguments",
    fallbackHint: "Use `o3o tx delete --id <id> [--yes]`.",
  })({ id });

  if (parsedArgs.isErr()) {
    return errAsync(parsedArgs.error);
  }

  const transactionId = parsedArgs.value.id;

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
    return deleteTransaction(transactionId).map(() => {
      printSuccessMessage("tx.delete", "Deleted.", outputMode);
      return undefined;
    });
  }

  return ResultAsync.fromPromise(
    (async () => {
      const rl = createInterface({ input: stdin, output: stdout });
      try {
        return await rl.question(`Delete transaction ${transactionId}? [y/N] `);
      } finally {
        rl.close();
      }
    })(),
    (cause) =>
      newRichError({
        cause,
        code: cliErrorCodes.CLI_PROMPT_READ_FAILED,
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

    return deleteTransaction(transactionId).map(() => {
      printSuccessMessage("tx.delete", "Deleted.", outputMode);
      return undefined;
    });
  });
}

function isInteractiveTerminal(): boolean {
  return stdin.isTTY === true && stdout.isTTY === true;
}
