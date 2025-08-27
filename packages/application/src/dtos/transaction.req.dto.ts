import { parseWith } from "@repo/toolkit";
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

const createTransactionReqDtoSchema = z.object({
  type: z.enum(["BUY", "SELL"]),
  datetime: z.coerce.date(),
  amount: PositiveDecimalSchema,
  price: PositiveDecimalSchema,
  currency: z.string().regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code"),
  profitLoss: DecimalStringSchema.optional(),
  fee: NonNegativeDecimalSchema.optional(),
  feeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
  userId: z.string().min(1, "UserId is required"),
});

const updateTransactionReqDtoSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  type: z.enum(["BUY", "SELL"]).optional(),
  datetime: z.coerce.date().optional(),
  amount: PositiveDecimalSchema.optional(),
  price: PositiveDecimalSchema.optional(),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
  profitLoss: DecimalStringSchema.optional(),
  fee: NonNegativeDecimalSchema.optional(),
  feeCurrency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Must be a 3-letter currency code")
    .optional(),
});

const getTransactionsReqDtoSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
});

const deleteTransactionReqDtoSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  userId: z.string().min(1, "UserId is required"),
});

export type CreateTransactionReqDto = z.infer<
  typeof createTransactionReqDtoSchema
>;
export type UpdateTransactionReqDto = z.infer<
  typeof updateTransactionReqDtoSchema
>;
export type GetTransactionsReqDto = z.infer<typeof getTransactionsReqDtoSchema>;
export type DeleteTransactionReqDto = z.infer<
  typeof deleteTransactionReqDtoSchema
>;

export const parseCreateTransactionReqDto = parseWith(
  createTransactionReqDtoSchema,
  {
    action: "ParseCreateTransactionReqDto",
  },
);

export const parseUpdateTransactionReqDto = parseWith(
  updateTransactionReqDtoSchema,
  {
    action: "ParseUpdateTransactionReqDto",
  },
);

export const parseGetTransactionsReqDto = parseWith(
  getTransactionsReqDtoSchema,
  {
    action: "ParseGetTransactionsReqDto",
  },
);

export const parseDeleteTransactionReqDto = parseWith(
  deleteTransactionReqDtoSchema,
  {
    action: "ParseDeleteTransactionReqDto",
  },
);
