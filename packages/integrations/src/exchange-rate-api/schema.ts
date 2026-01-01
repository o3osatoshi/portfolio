import { z } from "zod";

export const exchangeRateApiPairSchema = z.object({
  base_code: z.string().optional(),
  conversion_rate: z.union([z.number(), z.string()]).optional(),
  documentation: z.string().optional(),
  "error-type": z.string().optional(),
  result: z.string().optional(),
  target_code: z.string().optional(),
  terms_of_use: z.string().optional(),
  time_last_update_unix: z.number().optional(),
  time_last_update_utc: z.string().optional(),
  time_next_update_unix: z.number().optional(),
  time_next_update_utc: z.string().optional(),
});

export type ExchangeRatePair = z.infer<typeof exchangeRateApiPairSchema>;
