import { err, ok, type Result } from "neverthrow";

import { newRichError, type RichError } from "./error";
import type { JsonContainer, JsonValue } from "./types";

/**
 * Options for {@link deserialize}.
 *
 * @remarks
 * Passed through to `JSON.parse`.
 *
 * @public
 */
export type JsonDeserializeOptions = {
  /**
   * Optional reviver invoked for each parsed property during `JSON.parse`.
   */
  reviver?: Parameters<typeof JSON.parse>[1];
};

/**
 * Options for {@link serialize}.
 *
 * @remarks
 * Passed through to `JSON.stringify`.
 *
 * @public
 */
export type JsonSerializeOptions = {
  /**
   * Optional replacer used to filter or transform values during serialization.
   */
  replacer?: Parameters<typeof JSON.stringify>[1];
  /**
   * Optional indentation passed to `JSON.stringify` for pretty-printed output.
   */
  space?: Parameters<typeof JSON.stringify>[2];
};

/**
 * Parses a JSON string into a top-level JSON object or array.
 *
 * @remarks
 * This is stricter than bare `JSON.parse`:
 * - parsing must succeed
 * - the top-level decoded value must be an object (`{}`) or array (`[]`)
 *
 * Primitive JSON values such as `"hello"`, `123`, `true`, or `null` are
 * rejected and returned as a `Serialization` {@link RichError}.
 *
 * @param value - JSON string to parse.
 * @param options - Optional `JSON.parse` settings such as `reviver`.
 * @returns A neverthrow result containing a {@link JsonContainer} on success, or a structured error on failure.
 * @example
 * ```ts
 * const result = deserialize('{"count":"1"}', {
 *   reviver: (key, value) => (key === "count" ? Number(value) : value),
 * });
 * ```
 * @public
 */
export function deserialize(
  value: string,
  options: JsonDeserializeOptions = {},
): Result<JsonContainer, RichError> {
  return _deserialize(value, options).andThen((v) => {
    if (isJsonContainer(v)) {
      return ok(v);
    }
    return err(
      newRichError({
        cause: v,
        code: "JSON_CODEC_CONTAINER_EXPECTED",
        details: {
          action: "DeserializeJsonContainer",
          hint: "Ensure the JSON string encodes an object (`{}`) or array (`[]`).",
          reason: "Expected top-level JSON object or array",
        },
        isOperational: false,
        kind: "Serialization",
        layer: "Infrastructure",
      }),
    );
  });
}

/**
 * Serializes a value to JSON.
 *
 * @remarks
 * This wraps `JSON.stringify` in a neverthrow `Result`.
 *
 * Serialization fails when:
 * - `JSON.stringify` throws (for example, because of cyclic references)
 * - `JSON.stringify` returns `undefined` instead of a string
 *
 * @param value - Arbitrary value to serialize.
 * @param options - Optional `JSON.stringify` settings such as `replacer` and `space`.
 * @returns A neverthrow result containing the JSON string on success, or a structured error on failure.
 * @example
 * ```ts
 * const result = serialize({ count: 1 }, { space: 2 });
 * ```
 * @public
 */
export function serialize(
  value: unknown,
  options: JsonSerializeOptions = {},
): Result<string, RichError> {
  try {
    const encoded = JSON.stringify(value, options.replacer, options.space);
    if (encoded === undefined) {
      return err(
        newRichError({
          code: "JSON_CODEC_ENCODE_FAILED",
          details: {
            action: "SerializeJson",
            hint: "Ensure the value is JSON-serializable.",
            reason: "Failed to serialize value as JSON",
          },
          isOperational: false,
          kind: "Serialization",
          layer: "Infrastructure",
        }),
      );
    }
    return ok(encoded);
  } catch (cause) {
    return err(
      newRichError({
        cause,
        code: "JSON_CODEC_ENCODE_FAILED",
        details: {
          action: "SerializeJson",
          hint: "Ensure the value is JSON-serializable.",
          reason: "Failed to serialize value as JSON",
        },
        isOperational: false,
        kind: "Serialization",
        layer: "Infrastructure",
      }),
    );
  }
}

function _deserialize(
  value: string,
  options: JsonDeserializeOptions,
): Result<JsonValue, RichError> {
  try {
    return ok(JSON.parse(value, options.reviver));
  } catch (cause) {
    return err(
      newRichError({
        cause,
        code: "JSON_CODEC_DECODE_FAILED",
        details: {
          action: "DeserializeJson",
          hint: "Ensure the input string is valid JSON.",
          reason: "Failed to deserialize value from JSON",
        },
        isOperational: false,
        kind: "Serialization",
        layer: "Infrastructure",
      }),
    );
  }
}

function isJsonContainer(value: JsonValue): value is JsonContainer {
  return Array.isArray(value) || (typeof value === "object" && value !== null);
}
