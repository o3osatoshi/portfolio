import { err, ok, type Result } from "neverthrow";

import { newError } from "./error";
import type { JsonContainer, JsonValue } from "./types";

/**
 * Parses a JSON string into a {@link JsonContainer}, returning a neverthrow result.
 *
 * The input must represent a top-level JSON object (`{}`) or array (`[]`).
 * If parsing fails or the decoded value is a JSON primitive
 * (`string`, `number`, `boolean`, or `null`), this returns an error of kind
 * `"Serialization"` from the `"Infra"` layer.
 *
 * @param value - JSON string to parse.
 * @returns A neverthrow result containing a {@link JsonContainer} on success, or a structured error on failure.
 * @public
 */
export function decode(value: string): Result<JsonContainer, Error> {
  return _decode(value).andThen((v) => {
    if (Array.isArray(v) || (typeof v === "object" && v !== null)) {
      return ok<JsonContainer, Error>(v as JsonContainer);
    }
    return err<JsonContainer, Error>(
      newError({
        action: "DecodeJsonContainer",
        cause: v,
        hint: "Ensure the JSON string encodes an object (`{}`) or array (`[]`).",
        kind: "Serialization",
        layer: "Infra",
        reason: "Expected top-level JSON object or array",
      }),
    );
  });
}

/**
 * Serializes a value to JSON, returning a neverthrow result.
 *
 * When `JSON.stringify` succeeds, this returns an `ok` result containing
 * the encoded JSON string. If serialization throws (for example, because
 * of cyclic references), this returns a `"Serialization"` error from the
 * `"Infra"` layer.
 *
 * @param value - Arbitrary value to serialize.
 * @returns A neverthrow result containing the JSON string on success, or a structured error on failure.
 * @public
 */
export function encode(value: unknown): Result<string, Error> {
  try {
    return ok<string, Error>(JSON.stringify(value));
  } catch (cause) {
    return err<string, Error>(
      newError({
        action: "EncodeJson",
        cause,
        hint: "Ensure the value is JSON-serializable.",
        kind: "Serialization",
        layer: "Infra",
        reason: "Failed to encode value as JSON",
      }),
    );
  }
}

function _decode(value: string): Result<JsonValue, Error> {
  try {
    return ok<JsonValue, Error>(JSON.parse(value) as JsonValue);
  } catch (cause) {
    return err<JsonValue, Error>(
      newError({
        action: "DecodeJson",
        cause,
        hint: "Ensure the input string is valid JSON.",
        kind: "Serialization",
        layer: "Infra",
        reason: "Failed to decode value from JSON",
      }),
    );
  }
}
