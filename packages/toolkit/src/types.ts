import { z } from "zod";

/**
 * Canonical deployment environment label used across this workspace.
 *
 * @remarks
 * - Intended for high-level environment classification (e.g. telemetry, config).
 * - Values are kept deliberately small and opinionated to match common stages.
 *
 * @public
 */
export type Env = "development" | "local" | "production" | "staging";

/**
 * JSON array value.
 *
 * @public
 */
export type JsonArray = JsonValue[];

/**
 * JSON container value (object or array) at the top level.
 *
 * @public
 */
export type JsonContainer = JsonArray | JsonObject;

/**
 * JSON object value with string keys.
 *
 * @public
 */
export type JsonObject = { [key: string]: JsonValue };

/**
 * JSON-compatible primitive value (string, number, boolean, or null).
 *
 * @public
 */
export type JsonPrimitive = boolean | null | number | string;

/**
 * JSON value as defined by the JSON specification.
 *
 * @public
 * @remarks
 * - Can be a primitive, array, or object.
 * - Nested values are also constrained to {@link JsonValue}.
 */
export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

/**
 * Zod schema for {@link JsonPrimitive}.
 *
 * @public
 */
export const jsonPrimitiveSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

/**
 * Zod schema for {@link JsonValue}.
 *
 * @remarks
 * Uses `z.lazy` to support recursive object/array nesting.
 *
 * @public
 */
export const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([jsonPrimitiveSchema, jsonObjectSchema, jsonArraySchema]),
);

/**
 * Zod schema for {@link JsonObject}.
 *
 * @public
 */
export const jsonObjectSchema: z.ZodType<JsonObject> = z.record(
  z.string(),
  jsonValueSchema,
);

/**
 * Zod schema for {@link JsonArray}.
 *
 * @public
 */
export const jsonArraySchema: z.ZodType<JsonArray> = z.array(jsonValueSchema);

/**
 * Generic object-shaped JSON-compatible record.
 *
 * @public
 * @remarks
 * - Narrows the built-in `Object` type to a simple `Record<string, unknown>`.
 * - Prefer supplying a more specific type parameter where your value has a known shape.
 */
export type UnknownRecord = Record<string, unknown>;
