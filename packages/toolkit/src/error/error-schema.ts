import { z } from "zod";

/**
 * Generic error classifications shared across application layers.
 *
 * Recommended meanings (and default HTTP mappings used by `toHttpErrorResponse()`):
 * - `"BadGateway"` → upstream dependency returned an invalid/5xx response (502).
 * - `"BadRequest"` → malformed payload or invalid query before validation (400).
 * - `"Canceled"` → caller canceled or aborted the request (408).
 * - `"Config"` → server-side misconfiguration detected (500).
 * - `"Conflict"` → state/version mismatch such as optimistic locking (409).
 * - `"Deadlock"` → concurrency deadlock detected by the data store (409).
 * - `"Forbidden"` → authenticated caller lacks permission (403).
 * - `"Integrity"` → constraint violations such as unique/index failures (409).
 * - `"MethodNotAllowed"` → HTTP verb not supported for the resource (405).
 * - `"NotFound"` → entity or route missing (404).
 * - `"RateLimit"` → throttling or quota exceeded (429).
 * - `"Serialization"` → encode/decode failures (500).
 * - `"Timeout"` → upstream or local job timed out (504).
 * - `"Unauthorized"` → authentication missing or invalid (401).
 * - `"Unavailable"` → dependency or subsystem temporarily down (503).
 * - `"Unknown"` → fallback for uncategorized errors (500).
 * - `"Unprocessable"` → semantically invalid input even though syntactically valid (422).
 * - `"Validation"` → domain/application validation error (400).
 *
 * @public
 */
export const kindSchema = z.enum([
  "BadGateway",
  "BadRequest",
  "Canceled",
  "Config",
  "Conflict",
  "Deadlock",
  "Forbidden",
  "Integrity",
  "MethodNotAllowed",
  "NotFound",
  "RateLimit",
  "Serialization",
  "Timeout",
  "Unauthorized",
  "Unavailable",
  "Unknown",
  "Unprocessable",
  "Validation",
]);

/**
 * Generic error classification.
 *
 * @public
 */
export type Kind = z.infer<typeof kindSchema>;

/**
 * Architectural layer where the error originated.
 *
 * @public
 */
export const layerSchema = z.enum([
  "Application",
  "Auth",
  "DB",
  "Domain",
  "External",
  "Infra",
  "UI",
]);

/**
 * Architectural layer.
 *
 * @public
 */
export type Layer = z.infer<typeof layerSchema>;

/**
 * Structured descriptor for human context.
 *
 * @public
 */
export const richErrorDetailsSchema = z
  .object({
    action: z.string().optional(),
    hint: z.string().optional(),
    impact: z.string().optional(),
    reason: z.string().optional(),
  })
  .strip();

/**
 * Structured descriptor for human context.
 *
 * @public
 */
export type RichErrorDetails = z.infer<typeof richErrorDetailsSchema>;

/**
 * i18n key + params for UI-facing messages.
 *
 * @public
 */
export const richErrorI18nSchema = z
  .object({
    key: z.string(),
    params: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
      .optional(),
  })
  .strip();

/**
 * i18n key + params for UI-facing messages.
 *
 * @public
 */
export type RichErrorI18n = z.infer<typeof richErrorI18nSchema>;
