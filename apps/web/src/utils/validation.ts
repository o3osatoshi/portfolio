import { z } from "zod";

// decimal-as-string schema: accept string or number, output canonical string
const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v.toString() : v))
  .pipe(z.string().regex(/^-?(?:\d+)(?:\.\d+)?$/));

export const createTransactionSchema = z.object({
  amount: decimalString,
  currency: z.string(),
  datetime: z.coerce.date(),
  fee: decimalString.optional(),
  feeCurrency: z.string().optional(),
  price: decimalString,
  profitLoss: decimalString.optional(),
  type: z.string(),
});

export const updateTransactionSchema = z.object({
  id: z.string(),
  amount: decimalString.optional(),
  currency: z.string().optional(),
  datetime: z.coerce.date().optional(),
  fee: decimalString.optional(),
  feeCurrency: z.string().optional(),
  price: decimalString.optional(),
  profitLoss: decimalString.optional(),
  type: z.string().optional(),
});
