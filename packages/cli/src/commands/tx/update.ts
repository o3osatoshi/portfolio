import { errAsync, type ResultAsync } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";

import { updateTransaction } from "../../lib/api-client";
import { cliErrorCodes } from "../../lib/cli-error-catalog";
import { parseCliWithSchema } from "../../lib/cli-zod";
import { type OutputMode, printSuccessMessage } from "../../lib/output";

type UpdateArgs = {
  amount?: string | undefined;
  currency?: string | undefined;
  datetime?: string | undefined;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  id: string;
  price?: string | undefined;
  profitLoss?: string | undefined;
  type?: "BUY" | "SELL" | undefined;
};

const nonEmptyTrimmedString = z.string().trim().min(1);

const txUpdateArgsSchema = z.object({
  id: nonEmptyTrimmedString,
  amount: nonEmptyTrimmedString.optional(),
  currency: nonEmptyTrimmedString.optional(),
  datetime: nonEmptyTrimmedString.optional(),
  fee: nonEmptyTrimmedString.optional(),
  feeCurrency: nonEmptyTrimmedString.optional(),
  price: nonEmptyTrimmedString.optional(),
  profitLoss: nonEmptyTrimmedString.optional(),
  type: z.enum(["BUY", "SELL"]).optional(),
});

export function runTxUpdate(
  args: UpdateArgs,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const parsed = parseCliWithSchema(txUpdateArgsSchema, args, {
    action: "ParseTxUpdateArguments",
    code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
    context: "tx update arguments",
    fallbackHint: "Use `o3o tx update --help` to review accepted options.",
  });

  if (parsed.isErr()) {
    return errAsync(parsed.error);
  }

  return updateTransaction(parsed.value.id, {
    ...(parsed.value.amount !== undefined
      ? { amount: parsed.value.amount }
      : {}),
    ...(parsed.value.currency !== undefined
      ? { currency: parsed.value.currency }
      : {}),
    ...(parsed.value.datetime !== undefined
      ? { datetime: parsed.value.datetime }
      : {}),
    ...(parsed.value.fee !== undefined ? { fee: parsed.value.fee } : {}),
    ...(parsed.value.feeCurrency !== undefined
      ? { feeCurrency: parsed.value.feeCurrency }
      : {}),
    ...(parsed.value.price !== undefined ? { price: parsed.value.price } : {}),
    ...(parsed.value.profitLoss !== undefined
      ? { profitLoss: parsed.value.profitLoss }
      : {}),
    ...(parsed.value.type !== undefined ? { type: parsed.value.type } : {}),
  }).map(() => {
    printSuccessMessage("tx.update", "Updated.", outputMode);
    return undefined;
  });
}
