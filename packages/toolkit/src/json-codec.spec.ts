import { describe, expect, it } from "vitest";

import { isRichError } from "./error";
import { decode, encode } from "./json-codec";

describe("json-codec encode", () => {
  it("returns ok with JSON string for serializable object", () => {
    const value = { count: 1, foo: "bar" };

    const result = encode(value);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected encode to succeed");
    expect(result.value).toBe(JSON.stringify(value));
  });

  it("returns ok for arrays and primitive values", () => {
    const cases: unknown[] = [[1, 2, 3], "hello", 42, true, null];

    for (const value of cases) {
      const result = encode(value);

      expect(result.isOk()).toBe(true);
      if (!result.isOk()) throw new Error("Expected encode to succeed");
      expect(result.value).toBe(JSON.stringify(value));
    }
  });

  it("returns structured Serialization error when JSON.stringify throws", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    const result = encode(cyclic);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected encode to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfrastructureSerializationError");

    expect(isRichError(error)).toBe(true);
    if (isRichError(error)) {
      expect(error.details?.action).toBe("EncodeJson");
      expect(error.details?.reason).toBe("Failed to encode value as JSON");
      expect(error.details?.hint).toBe(
        "Ensure the value is JSON-serializable.",
      );
    }
  });
});

describe("json-codec decode", () => {
  it("returns ok with parsed value for JSON object", () => {
    const value = { count: 1, foo: "bar" };
    const raw = JSON.stringify(value);

    const result = decode(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected decode to succeed");
    expect(result.value).toEqual(value);
  });

  it("returns ok with parsed value for JSON array", () => {
    const value = [1, 2, { foo: "bar" }];
    const raw = JSON.stringify(value);

    const result = decode(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected decode to succeed");
    expect(result.value).toEqual(value);
  });

  it("handles nested objects and arrays", () => {
    const value = {
      foo: "bar",
      nested: {
        count: 1,
        items: [1, { ok: true }],
      },
    };
    const raw = JSON.stringify(value);

    const result = decode(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected decode to succeed");
    expect(result.value).toEqual(value);
  });

  it("returns structured Serialization error when JSON.parse throws", () => {
    const raw = "{invalid-json";

    const result = decode(raw);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected decode to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfrastructureSerializationError");

    expect(isRichError(error)).toBe(true);
    if (isRichError(error)) {
      expect(error.details?.action).toBe("DecodeJson");
      expect(error.details?.reason).toBe("Failed to decode value from JSON");
      expect(error.details?.hint).toBe(
        "Ensure the input string is valid JSON.",
      );
    }
  });

  it("returns structured Serialization error for primitive JSON values", () => {
    const primitives: unknown[] = ["hello", 123, true, null];

    for (const primitive of primitives) {
      const raw = JSON.stringify(primitive);

      const result = decode(raw);

      expect(result.isErr()).toBe(true);
      if (!result.isErr())
        throw new Error("Expected decode to fail for primitive JSON value");

      const error = result.error;
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InfrastructureSerializationError");

      expect(isRichError(error)).toBe(true);
      if (isRichError(error)) {
        expect(error.details?.action).toBe("DecodeJsonContainer");
        expect(error.details?.reason).toBe(
          "Expected top-level JSON object or array",
        );
        expect(error.details?.hint).toBe(
          "Ensure the JSON string encodes an object (`{}`) or array (`[]`).",
        );
      }
    }
  });
});
