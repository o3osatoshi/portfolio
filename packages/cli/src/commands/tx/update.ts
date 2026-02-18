import { updateTransaction } from "../../lib/api-client";

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

export async function runTxUpdate(args: UpdateArgs): Promise<void> {
  await updateTransaction(args.id, {
    ...(args.amount ? { amount: args.amount } : {}),
    ...(args.currency ? { currency: args.currency } : {}),
    ...(args.datetime ? { datetime: args.datetime } : {}),
    ...(args.fee ? { fee: args.fee } : {}),
    ...(args.feeCurrency ? { feeCurrency: args.feeCurrency } : {}),
    ...(args.price ? { price: args.price } : {}),
    ...(args.profitLoss ? { profitLoss: args.profitLoss } : {}),
    ...(args.type ? { type: args.type } : {}),
  });

  console.log("Updated.");
}
