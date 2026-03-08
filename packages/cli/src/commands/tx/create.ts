import { errAsync, type ResultAsync } from "neverthrow";
import { z } from "zod";

import { encode, omitUndefined, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { type OutputMode, printSuccessData } from "../../common/output";
import { makeCliSchemaParser } from "../../common/zod-validation";
import { createTransaction } from "../../services/tx/transaction-api.service";

type TxCreateArgs = {
  amount: string;
  currency: string;
  datetime: string;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  price: string;
  profitLoss?: string | undefined;
  type: "BUY" | "SELL";
};

const nonEmptyTrimmedString = z.string().trim().min(1);

const txCreateArgsSchema = z.object({
  amount: nonEmptyTrimmedString,
  currency: nonEmptyTrimmedString,
  datetime: nonEmptyTrimmedString,
  fee: nonEmptyTrimmedString.optional(),
  feeCurrency: nonEmptyTrimmedString.optional(),
  price: nonEmptyTrimmedString,
  profitLoss: nonEmptyTrimmedString.optional(),
  type: z.enum(["BUY", "SELL"]),
});

export function runTxCreate(
  args: TxCreateArgs,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const parsed = makeCliSchemaParser(txCreateArgsSchema, {
    action: "ParseTxCreateArguments",
    code: cliErrorCodes.CLI_COMMAND_INVALID_ARGUMENT,
    context: "tx create arguments",
    fallbackHint: "Use `o3o tx create --help` to review required options.",
  })(args);

  if (parsed.isErr()) {
    return errAsync(parsed.error);
  }

  return createTransaction(
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
  ).map((created) => {
    printSuccessData("tx.create", created, outputMode, (data) => {
      const serialized = encode(data, { space: 2 });
      if (serialized.isErr()) {
        console.log(String(data));
        return;
      }
      console.log(serialized.value);
    });
    return undefined;
  });
}
