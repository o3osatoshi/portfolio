import { z } from "zod";

// decimal-as-string schema: accept string or number, output canonical string
const decimalString = z
  .union([z.string(), z.number()])
  .transform((v) => (typeof v === "number" ? v.toString() : v))
  .pipe(z.string().regex(/^-?(?:\d+)(?:\.\d+)?$/));

export const transactionSchema = z.object({
  amount: decimalString,
  createdAt: z.coerce.date(),
  currency: z.string(),
  datetime: z.coerce.date(),
  fee: decimalString.optional(),
  feeCurrency: z.string().optional(),
  id: z.string(),
  price: decimalString,
  profitLoss: decimalString.optional(),
  type: z.string(),
  updatedAt: z.coerce.date(),
  userId: z.string(),
});

export type Transaction = z.infer<typeof transactionSchema>;

export const transactionsSchema = z.array(transactionSchema);

export type Transactions = z.infer<typeof transactionsSchema>;

export function validateTransactions(input: unknown): Transactions {
  return transactionsSchema.parse(input);
}

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

export type CreateTransaction = z.infer<typeof createTransactionSchema>;

export function validateCreateTransaction(input: unknown): CreateTransaction {
  return createTransactionSchema.parse(input);
}

export const updateTransactionSchema = z.object({
  amount: decimalString.optional(),
  currency: z.string().optional(),
  datetime: z.coerce.date().optional(),
  fee: decimalString.optional(),
  feeCurrency: z.string().optional(),
  id: z.string(),
  price: decimalString.optional(),
  profitLoss: decimalString.optional(),
  type: z.string().optional(),
});

export type UpdateTransaction = z.infer<typeof updateTransactionSchema>;

export function validateUpdateTransaction(input: unknown): UpdateTransaction {
  return updateTransactionSchema.parse(input);
}

export const deleteTransactionSchema = z.object({
  id: z.string(),
});

export type DeleteTransaction = z.infer<typeof deleteTransactionSchema>;

export function validateDeleteTransaction(input: unknown): DeleteTransaction {
  return deleteTransactionSchema.parse(input);
}
