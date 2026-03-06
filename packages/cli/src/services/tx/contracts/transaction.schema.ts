import { z } from "zod";

export const transactionSchema = z.object({
  id: z.string(),
  amount: z.string(),
  createdAt: z.string().or(z.date()),
  currency: z.string(),
  datetime: z.string().or(z.date()),
  fee: z.string().optional(),
  feeCurrency: z.string().optional(),
  price: z.string(),
  profitLoss: z.string().optional(),
  type: z.enum(["BUY", "SELL"]),
  updatedAt: z.string().or(z.date()),
  userId: z.string(),
});

export const transactionListSchema = z.array(transactionSchema);

export type TransactionResponse = z.infer<typeof transactionSchema>;
