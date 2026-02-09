import { z } from "zod";

import { parseWith } from "@o3osatoshi/toolkit";

import { toApplicationError } from "../application-error";
import {
  applicationErrorCodes,
  applicationErrorI18nKeys,
} from "../application-error-catalog";

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
const parseGetFxQuoteRequestBase = parseWith(getFxQuoteRequestSchema, {
  action: "ParseGetFxQuoteRequest",
});

/**
 * Parse and validate an unknown payload into {@link GetFxQuoteRequest}.
 */
export const parseGetFxQuoteRequest = (input: unknown) =>
  parseGetFxQuoteRequestBase(input).mapErr((cause) =>
    toApplicationError({
      action: "ParseGetFxQuoteRequest",
      cause,
      code: applicationErrorCodes.GET_FX_QUOTE_REQUEST_INVALID,
      i18n: { key: applicationErrorI18nKeys.VALIDATION },
      kind: "Validation",
    }),
  );
