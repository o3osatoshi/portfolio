import { z } from "zod";

export const transactionsSchema = z.array(
  z.object({
    props: z.object({
      id: z.string(),
      type: z.string(),
      datetime: z.coerce.date(),
      amount: z.coerce.number(),
      price: z.coerce.number(),
      currency: z.string(),
      profitLoss: z.coerce.number().optional(),
      fee: z.coerce.number().optional(),
      feeCurrency: z.string().optional(),
      userId: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date(),
    }),
  }),
);

export type Transactions = z.infer<typeof transactionsSchema>;

export function validateTransactions(input: unknown): Transactions {
  return transactionsSchema.parse(input);
}

export const createTransactionSchema = z.object({
  type: z.string(),
  datetime: z.coerce.date(),
  amount: z.coerce.number(),
  price: z.coerce.number(),
  currency: z.string(),
  profitLoss: z.coerce.number().optional(),
  fee: z.coerce.number().optional(),
  feeCurrency: z.string().optional(),
});

export type CreateTransaction = z.infer<typeof createTransactionSchema>;

export function validateCreateTransaction(input: unknown): CreateTransaction {
  return createTransactionSchema.parse(input);
}

export const updateTransactionSchema = z.object({
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
