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

export async function runTxCreate(args: CreateArgs): Promise<void> {
  const created = await createTransaction({
    amount: args.amount,
    currency: args.currency,
    datetime: args.datetime,
    ...(args.fee ? { fee: args.fee } : {}),
    ...(args.feeCurrency ? { feeCurrency: args.feeCurrency } : {}),
    price: args.price,
    ...(args.profitLoss ? { profitLoss: args.profitLoss } : {}),
    type: args.type,
  });

  console.log(JSON.stringify(created, null, 2));
}
