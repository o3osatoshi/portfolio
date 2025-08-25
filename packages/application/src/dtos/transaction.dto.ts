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

export const CreateTransactionDtoSchema = z.object({
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

export const UpdateTransactionDtoSchema = z.object({
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

export const GetTransactionsDtoSchema = z.object({
  userId: z.string().min(1, "UserId is required"),
});

export const GetTransactionByIdDtoSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
});

export const DeleteTransactionDtoSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  userId: z.string().min(1, "UserId is required"),
});

export type CreateTransactionDto = z.infer<typeof CreateTransactionDtoSchema>;
export type UpdateTransactionDto = z.infer<typeof UpdateTransactionDtoSchema>;
export type GetTransactionsDto = z.infer<typeof GetTransactionsDtoSchema>;
export type GetTransactionByIdDto = z.infer<typeof GetTransactionByIdDtoSchema>;
export type DeleteTransactionDto = z.infer<typeof DeleteTransactionDtoSchema>;
