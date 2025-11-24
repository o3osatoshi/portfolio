import { z } from "zod";

import { parseWith } from "@o3osatoshi/toolkit";

const DecimalStringSchema = z.string().refine(
  (val) => {
    try {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && Number.isFinite(num);
    } catch {
      return false;
    }
  },
  { message: "Must be a valid decimal string" },
);

const PositiveDecimalSchema = DecimalStringSchema.refine(
  (val) => Number.parseFloat(val) > 0,
  { message: "Must be greater than 0" },
);

const NonNegativeDecimalSchema = DecimalStringSchema.refine(
  (val) => Number.parseFloat(val) >= 0,
  { message: "Must be greater than or equal to 0" },
);

/**
 * Schema describing the payload required to create a transaction from the API.
 */
export const createTransactionRequestSchema = z.object({
  amount: PositiveDecimalSchema,
  currency: z.string().regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code"),
  datetime: z.coerce.date(),
  fee: NonNegativeDecimalSchema.optional(),
  feeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
  price: PositiveDecimalSchema,
  profitLoss: DecimalStringSchema.optional(),
  type: z.enum(["BUY", "SELL"]),
  userId: z.string().min(1, "UserId is required"),
});

/**
 * Schema describing partial updates allowed on an existing transaction.
 */
export const updateTransactionRequestSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  amount: PositiveDecimalSchema.optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
  datetime: z.coerce.date().optional(),
  fee: NonNegativeDecimalSchema.optional(),
  feeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
  price: PositiveDecimalSchema.optional(),
  profitLoss: DecimalStringSchema.optional(),
  type: z.enum(["BUY", "SELL"]).optional(),
});

/**
 * Schema describing the payload to list transactions for a user.
 */
export const getTransactionsRequestSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
});

/**
 * Schema describing the payload to delete a transaction owned by a user.
 */
export const deleteTransactionRequestSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  userId: z.string().min(1, "UserId is required"),
});

/**
 * Validated shape of a create-transaction request after Zod parsing.
 */
export type CreateTransactionRequest = z.infer<
  typeof createTransactionRequestSchema
>;
/**
 * Validated shape of a delete-transaction request after Zod parsing.
 */
export type DeleteTransactionRequest = z.infer<
  typeof deleteTransactionRequestSchema
>;
/**
 * Validated shape of a get-transactions request after Zod parsing.
 */
export type GetTransactionsRequest = z.infer<
  typeof getTransactionsRequestSchema
>;
/**
 * Validated shape of an update-transaction request after Zod parsing.
 */
export type UpdateTransactionRequest = z.infer<
  typeof updateTransactionRequestSchema
>;

/**
 * Parse and validate an unknown payload into {@link CreateTransactionRequest}.
 * Wraps `parseWith` to return a `Result` with typed error metadata.
 */
export const parseCreateTransactionRequest = parseWith(
  createTransactionRequestSchema,
  {
    action: "ParseCreateTransactionRequest",
  },
);
/**
 * Parse and validate an unknown payload into {@link UpdateTransactionRequest}.
 */
export const parseUpdateTransactionRequest = parseWith(
  updateTransactionRequestSchema,
  {
    action: "ParseUpdateTransactionRequest",
  },
);
/**
 * Parse and validate an unknown payload into {@link GetTransactionsRequest}.
 */
export const parseGetTransactionsRequest = parseWith(
  getTransactionsRequestSchema,
  {
    action: "ParseGetTransactionsRequest",
  },
);
/**
 * Parse and validate an unknown payload into {@link DeleteTransactionRequest}.
 */
export const parseDeleteTransactionRequest = parseWith(
  deleteTransactionRequestSchema,
  {
    action: "ParseDeleteTransactionRequest",
  },
);
