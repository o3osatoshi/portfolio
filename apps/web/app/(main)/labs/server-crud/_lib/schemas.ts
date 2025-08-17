import { z } from "zod";

export const zCreateTransaction = z.object({
  type: z.string(),
  datetime: z.coerce.date(),
  amount: z.coerce.number(),
  price: z.coerce.number(),
  currency: z.string(),
  profitLoss: z.coerce.number().optional(),
  fee: z.coerce.number().optional(),
  feeCurrency: z.string().optional(),
});

export const zUpdateTransaction = z.object({
  id: z.string(),
  type: z.string().optional(),
  datetime: z.coerce.date().optional(),
  amount: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  currency: z.string().optional(),
  profitLoss: z.coerce.number().optional(),
  fee: z.coerce.number().optional(),
  feeCurrency: z.string().optional(),
});

export const zDeleteTransaction = z.object({
  id: z.string(),
});
