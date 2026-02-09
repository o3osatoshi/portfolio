import { z } from "zod";

import { parseWith } from "@o3osatoshi/toolkit";

import { ensureApplicationErrorI18n } from "../error-i18n";

const currencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/i, "Must be a 3-letter currency code")
  .transform((value) => value.toUpperCase());

/**
 * Schema describing the payload required to fetch an FX quote.
 */
export const getFxQuoteRequestSchema = z.object({
  base: currencyCodeSchema,
  quote: currencyCodeSchema,
});

/**
 * Validated shape of an FX-quote request after Zod parsing.
 */
export type GetFxQuoteRequest = z.infer<typeof getFxQuoteRequestSchema>;

/**
 * Parse and validate an unknown payload into {@link GetFxQuoteRequest}.
 */
export const parseGetFxQuoteRequest = (input: unknown) =>
  parseWith(getFxQuoteRequestSchema, {
    action: "ParseGetFxQuoteRequest",
  })(input).mapErr((error) =>
    ensureApplicationErrorI18n(error),
  );
