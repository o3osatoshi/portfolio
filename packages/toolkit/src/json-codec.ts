import { err, ok, type Result } from "neverthrow";

import { newRichError } from "./error";
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
    if (isJsonContainer(v)) {
      return ok<JsonContainer, Error>(v);
    }
    return err<JsonContainer, Error>(
      newRichError({
        cause: v,
        details: {
          action: "DecodeJsonContainer",
          hint: "Ensure the JSON string encodes an object (`{}`) or array (`[]`).",
          reason: "Expected top-level JSON object or array",
        },
        kind: "Serialization",
        layer: "Infra",
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
      newRichError({
        cause,
        details: {
          action: "EncodeJson",
          hint: "Ensure the value is JSON-serializable.",
          reason: "Failed to encode value as JSON",
        },
        kind: "Serialization",
        layer: "Infra",
      }),
    );
  }
}

function _decode(value: string): Result<JsonValue, Error> {
  try {
    return ok<JsonValue, Error>(JSON.parse(value));
  } catch (cause) {
    return err<JsonValue, Error>(
      newRichError({
        cause,
        details: {
          action: "DecodeJson",
          hint: "Ensure the input string is valid JSON.",
          reason: "Failed to decode value from JSON",
        },
        kind: "Serialization",
        layer: "Infra",
      }),
    );
  }
}

function isJsonContainer(value: JsonValue): value is JsonContainer {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}
