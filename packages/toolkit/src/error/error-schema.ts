import { z } from "zod";

import { jsonObjectSchema } from "../types";

/**
 * Generic error classifications shared across application layers.
 *
 * Recommended meanings (and default HTTP mappings used by `toHttpErrorResponse()`):
 * - `"BadGateway"` → upstream dependency returned an invalid/5xx response (502).
 * - `"BadRequest"` → malformed payload or invalid query before validation (400).
 * - `"Canceled"` → caller canceled or aborted the request (408).
 * - `"Conflict"` → state/version mismatch such as optimistic locking (409).
 * - `"Forbidden"` → authenticated caller lacks permission (403).
 * - `"Internal"` → unexpected internal failure (500).
 * - `"MethodNotAllowed"` → HTTP verb not supported for the resource (405).
 * - `"NotFound"` → entity or route missing (404).
 * - `"RateLimit"` → throttling or quota exceeded (429).
 * - `"Serialization"` → encode/decode failures (500).
 * - `"Timeout"` → upstream or local job timed out (504).
 * - `"Unauthorized"` → authentication missing or invalid (401).
 * - `"Unavailable"` → dependency or subsystem temporarily down (503).
 * - `"Unprocessable"` → semantically invalid input even though syntactically valid (422).
 * - `"Validation"` → domain/application validation error (400).
 *
 * @public
 */
export const kindSchema = z.enum([
  "BadGateway",
  "BadRequest",
  "Canceled",
  "Conflict",
  "Forbidden",
  "Internal",
  "MethodNotAllowed",
  "NotFound",
  "RateLimit",
  "Serialization",
  "Timeout",
  "Unauthorized",
  "Unavailable",
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
  "Domain",
  "External",
  "Infrastructure",
  "Interface",
  "Persistence",
  "Presentation",
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

/**
 * JSON-friendly representation of an Error instance for cross-boundary transport.
 *
 * @public
 */
export const serializedErrorSchema: z.ZodType<{
  cause?: string | undefined | z.infer<typeof serializedErrorSchema>;
  code?: string | undefined;
  details?: RichErrorDetails | undefined;
  i18n?: RichErrorI18n | undefined;
  isOperational?: boolean | undefined;
  kind?: Kind | undefined;
  layer?: Layer | undefined;
  message: string;
  meta?: undefined | z.infer<typeof jsonObjectSchema>;
  name: string;
  stack?: string | undefined;
}> = z
  .object({
    name: z.string(),
    cause: z
      .union([z.string(), z.lazy(() => serializedErrorSchema)])
      .optional(),
    code: z.string().optional(),
    details: richErrorDetailsSchema.optional(),
    i18n: richErrorI18nSchema.optional(),
    isOperational: z.boolean().optional(),
    kind: kindSchema.optional(),
    layer: layerSchema.optional(),
    message: z.string(),
    meta: jsonObjectSchema.optional(),
    stack: z.string().optional(),
  })
  .strip();

/**
 * Serialized error type inferred from {@link serializedErrorSchema}.
 *
 * @public
 */
export type SerializedError = z.infer<typeof serializedErrorSchema>;

/**
 * Strict RichError transport shape.
 *
 * Unlike {@link SerializedError}, this shape always includes both `kind` and `layer`.
 *
 * @public
 */
export type SerializedRichError = {
  isOperational: boolean;
  kind: Kind;
  layer: Layer;
} & Omit<SerializedError, "isOperational" | "kind" | "layer">;

/**
 * Strict schema for serialized RichError payloads.
 *
 * @public
 */
export const serializedRichErrorSchema: z.ZodType<SerializedRichError> =
  z.intersection(
    serializedErrorSchema,
    z.object({
      isOperational: z.boolean(),
      kind: kindSchema,
      layer: layerSchema,
    }),
  );

/**
 * Serialized cause type inferred from {@link serializedErrorSchema}.
 *
 * @public
 */
export type SerializedCause = Exclude<SerializedError["cause"], undefined>;
