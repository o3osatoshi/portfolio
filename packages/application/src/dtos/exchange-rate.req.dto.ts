import { z } from "zod";

import { parseWith } from "@o3osatoshi/toolkit";

const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/i, "Must be a 3-letter currency code")
  .transform((value) => value.toUpperCase());

/**
 * Schema describing the payload required to fetch a currency exchange rate.
 */
export const getExchangeRateRequestSchema = z.object({
  base: currencyCodeSchema,
  quote: currencyCodeSchema,
});

/**
 * Validated shape of a get-exchange-rate request after Zod parsing.
 */
export type GetExchangeRateRequest = z.infer<
  typeof getExchangeRateRequestSchema
>;

/**
 * Parse and validate an unknown payload into {@link GetExchangeRateRequest}.
 */
export const parseGetExchangeRateRequest = parseWith(
  getExchangeRateRequestSchema,
  {
    action: "ParseGetExchangeRateRequest",
  },
);
