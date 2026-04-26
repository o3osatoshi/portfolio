import { describe, expect, it } from "vitest";

import { isRichError } from "./error";
import { deserialize, serialize } from "./json-codec";

describe("json-codec serialize", () => {
  it("returns ok with JSON string for serializable object", () => {
    const value = { count: 1, foo: "bar" };

    const result = serialize(value);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected serialize to succeed");
    expect(result.value).toBe(JSON.stringify(value));
  });

  it("returns ok for arrays and primitive values", () => {
    const cases: unknown[] = [[1, 2, 3], "hello", 42, true, null];

    for (const value of cases) {
      const result = serialize(value);

      expect(result.isOk()).toBe(true);
      if (!result.isOk()) throw new Error("Expected serialize to succeed");
      expect(result.value).toBe(JSON.stringify(value));
    }
  });

  it("returns structured Serialization error when JSON.stringify throws", () => {
    const cyclic: { self?: unknown } = {};
    cyclic.self = cyclic;

    const result = serialize(cyclic);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected serialize to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfrastructureSerializationError");

    expect(isRichError(error)).toBe(true);
    if (isRichError(error)) {
      expect(error.details?.action).toBe("SerializeJson");
      expect(error.details?.reason).toBe("Failed to serialize value as JSON");
      expect(error.details?.hint).toBe(
        "Ensure the value is JSON-serializable.",
      );
    }
  });

  it("supports stringify options", () => {
    const value = { count: 1, foo: "bar" };

    const result = serialize(value, { space: 2 });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected serialize to succeed");
    expect(result.value).toBe('{\n  "count": 1,\n  "foo": "bar"\n}');
  });

  it("returns structured Serialization error when JSON.stringify yields undefined", () => {
    const result = serialize(undefined);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected serialize to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfrastructureSerializationError");

    expect(isRichError(error)).toBe(true);
    if (isRichError(error)) {
      expect(error.details?.action).toBe("SerializeJson");
      expect(error.details?.reason).toBe("Failed to serialize value as JSON");
      expect(error.details?.hint).toBe(
        "Ensure the value is JSON-serializable.",
      );
    }
  });
});

describe("json-codec deserialize", () => {
  it("returns ok with parsed value for JSON object", () => {
    const value = { count: 1, foo: "bar" };
    const raw = JSON.stringify(value);

    const result = deserialize(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected deserialize to succeed");
    expect(result.value).toEqual(value);
  });

  it("returns ok with parsed value for JSON array", () => {
    const value = [1, 2, { foo: "bar" }];
    const raw = JSON.stringify(value);

    const result = deserialize(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected deserialize to succeed");
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

    const result = deserialize(raw);

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected deserialize to succeed");
    expect(result.value).toEqual(value);
  });

  it("supports parse options", () => {
    const result = deserialize('{"count":"1"}', {
      reviver: (key, value) => {
        if (key === "count" && typeof value === "string") {
          return Number(value);
        }
        return value;
      },
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) throw new Error("Expected deserialize to succeed");
    expect(result.value).toEqual({ count: 1 });
  });

  it("returns structured Serialization error when JSON.parse throws", () => {
    const raw = "{invalid-json";

    const result = deserialize(raw);

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) throw new Error("Expected deserialize to fail");

    const error = result.error;
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("InfrastructureSerializationError");

    expect(isRichError(error)).toBe(true);
    if (isRichError(error)) {
      expect(error.details?.action).toBe("DeserializeJson");
      expect(error.details?.reason).toBe(
        "Failed to deserialize value from JSON",
      );
      expect(error.details?.hint).toBe(
        "Ensure the input string is valid JSON.",
      );
    }
  });

  it("returns structured Serialization error for primitive JSON values", () => {
    const primitives: unknown[] = ["hello", 123, true, null];

    for (const primitive of primitives) {
      const raw = JSON.stringify(primitive);

      const result = deserialize(raw);

      expect(result.isErr()).toBe(true);
      if (!result.isErr())
        throw new Error(
          "Expected deserialize to fail for primitive JSON value",
        );

      const error = result.error;
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe("InfrastructureSerializationError");

      expect(isRichError(error)).toBe(true);
      if (isRichError(error)) {
        expect(error.details?.action).toBe("DeserializeJsonContainer");
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
