import { z } from "zod";

export const meSchema = z.object({
  issuer: z.string(),
  scopes: z.array(z.string()),
  subject: z.string(),
  userId: z.string(),
});

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

export const apiErrorResponseSchema = z.looseObject({
  code: z.string().optional(),
  details: z
    .looseObject({
      reason: z.string().optional(),
    })
    .optional(),
  message: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;
export type MeResponse = z.infer<typeof meSchema>;
export type TransactionResponse = z.infer<typeof transactionSchema>;
