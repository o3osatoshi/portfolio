import { parseWith } from "@o3osatoshi/toolkit";
import { z } from "zod";

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

const createTransactionRequestSchema = z.object({
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

const updateTransactionRequestSchema = z.object({
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

const getTransactionsRequestSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
});

const deleteTransactionRequestSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  userId: z.string().min(1, "UserId is required"),
});

export type CreateTransactionRequest = z.infer<
  typeof createTransactionRequestSchema
>;
export type DeleteTransactionRequest = z.infer<
  typeof deleteTransactionRequestSchema
>;
export type GetTransactionsRequest = z.infer<
  typeof getTransactionsRequestSchema
>;
export type UpdateTransactionRequest = z.infer<
  typeof updateTransactionRequestSchema
>;

export const parseCreateTransactionRequest = parseWith(
  createTransactionRequestSchema,
  {
    action: "ParseCreateTransactionRequest",
  },
);

export const parseUpdateTransactionRequest = parseWith(
  updateTransactionRequestSchema,
  {
    action: "ParseUpdateTransactionRequest",
  },
);

export const parseGetTransactionsRequest = parseWith(
  getTransactionsRequestSchema,
  {
    action: "ParseGetTransactionsRequest",
  },
);

export const parseDeleteTransactionRequest = parseWith(
  deleteTransactionRequestSchema,
  {
    action: "ParseDeleteTransactionRequest",
  },
);
