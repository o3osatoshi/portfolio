import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { createTransaction } from "../../lib/api-client";

type CreateArgs = {
  amount: string;
  currency: string;
  datetime: string;
  fee?: string | undefined;
  feeCurrency?: string | undefined;
  price: string;
  profitLoss?: string | undefined;
  type: "BUY" | "SELL";
};

export function runTxCreate(args: CreateArgs): ResultAsync<void, RichError> {
  return createTransaction({
    amount: args.amount,
    currency: args.currency,
    datetime: args.datetime,
    ...(args.fee ? { fee: args.fee } : {}),
    ...(args.feeCurrency ? { feeCurrency: args.feeCurrency } : {}),
    price: args.price,
    ...(args.profitLoss ? { profitLoss: args.profitLoss } : {}),
    type: args.type,
  }).map((created) => {
    console.log(JSON.stringify(created, null, 2));
    return undefined;
  });
}
