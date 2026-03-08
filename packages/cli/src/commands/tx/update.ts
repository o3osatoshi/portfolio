import { errAsync, type ResultAsync } from "neverthrow";
import { z } from "zod";

import { omitUndefined, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { type OutputMode, printSuccessMessage } from "../../common/output";
import { makeCliSchemaParser } from "../../common/zod-validation";
import { updateTransaction } from "../../services/tx/transaction-api.service";

type TxUpdateArgs = {
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
  args: TxUpdateArgs,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const parsed = makeCliSchemaParser(txUpdateArgsSchema, {
    action: "ParseTxUpdateArguments",
    code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
    context: "tx update arguments",
    fallbackHint: "Use `o3o tx update --help` to review accepted options.",
  })(args);

  if (parsed.isErr()) {
    return errAsync(parsed.error);
  }

  return updateTransaction(
    parsed.value.id,
    omitUndefined({
      amount: parsed.value.amount,
      currency: parsed.value.currency,
      datetime: parsed.value.datetime,
      fee: parsed.value.fee,
      feeCurrency: parsed.value.feeCurrency,
      price: parsed.value.price,
      profitLoss: parsed.value.profitLoss,
      type: parsed.value.type,
    }),
  ).map(() => {
    printSuccessMessage("tx.update", "Updated.", outputMode);
    return undefined;
  });
}
