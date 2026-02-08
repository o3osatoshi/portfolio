import { err, ok, type Result } from "neverthrow";

import { newRichError, type RichError } from "./error";
import type { JsonContainer, JsonValue } from "./types";

/**
 * Parses a JSON string into a {@link JsonContainer}, returning a neverthrow result.
 *
 * The input must represent a top-level JSON object (`{}`) or array (`[]`).
 * If parsing fails or the decoded value is a JSON primitive
 * (`string`, `number`, `boolean`, or `null`), this returns an error of kind
 * `"Serialization"` from the `"Infrastructure"` layer.
 *
 * @param value - JSON string to parse.
 * @returns A neverthrow result containing a {@link JsonContainer} on success, or a structured error on failure.
 * @public
 */
export function decode(value: string): Result<JsonContainer, RichError> {
  return _decode(value).andThen((v) => {
    if (isJsonContainer(v)) {
      return ok<JsonContainer, RichError>(v);
    }
    return err<JsonContainer, RichError>(
      newRichError({
        cause: v,
        code: "JSON_CODEC_CONTAINER_EXPECTED",
        details: {
          action: "DecodeJsonContainer",
          hint: "Ensure the JSON string encodes an object (`{}`) or array (`[]`).",
          reason: "Expected top-level JSON object or array",
        },
        kind: "Serialization",
        layer: "Infrastructure",
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
 * `"Infrastructure"` layer.
 *
 * @param value - Arbitrary value to serialize.
 * @returns A neverthrow result containing the JSON string on success, or a structured error on failure.
 * @public
 */
export function encode(value: unknown): Result<string, RichError> {
  try {
    return ok<string, RichError>(JSON.stringify(value));
  } catch (cause) {
    return err<string, RichError>(
      newRichError({
        cause,
        code: "JSON_CODEC_ENCODE_FAILED",
        details: {
          action: "EncodeJson",
          hint: "Ensure the value is JSON-serializable.",
          reason: "Failed to encode value as JSON",
        },
        kind: "Serialization",
        layer: "Infrastructure",
      }),
    );
  }
}

function _decode(value: string): Result<JsonValue, RichError> {
  try {
    return ok<JsonValue, RichError>(JSON.parse(value));
  } catch (cause) {
    return err<JsonValue, RichError>(
      newRichError({
        cause,
        code: "JSON_CODEC_DECODE_FAILED",
        details: {
          action: "DecodeJson",
          hint: "Ensure the input string is valid JSON.",
          reason: "Failed to decode value from JSON",
        },
        kind: "Serialization",
        layer: "Infrastructure",
      }),
    );
  }
}

function isJsonContainer(value: JsonValue): value is JsonContainer {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}
