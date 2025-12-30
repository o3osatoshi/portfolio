import { z } from "zod";

export const exchangeRateHostResponseSchema = z.object({
  base: z.string(),
  date: z.string().optional(),
  error: z
    .object({
      code: z.number().optional(),
      info: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
  rates: z.record(z.string(), z.union([z.number(), z.string()])),
  success: z.boolean().optional(),
  timestamp: z.number().optional(),
});

export type ExchangeRateHostResponse = z.infer<
  typeof exchangeRateHostResponseSchema
>;
