import { describe, expect, it } from "vitest";

import {
  deserializeError,
  isSerializedError,
  type SerializedError,
  serializeError,
} from "./error-serializer";

describe("error-serializer", () => {
  it("serializes and deserializes a basic Error", () => {
    const e = new Error("oops");
    e.name = "TestError";
    const s = serializeError(e, { includeStack: true });
    expect(s.name).toBe("TestError");
    expect(s.message).toBe("oops");
    const d = deserializeError(s);
    expect(d.name).toBe("TestError");
    expect(d.message).toBe("oops");
  });

  it("handles string cause", () => {
    const e = new Error("top");
    e.cause = "inner";
    const s = serializeError(e, { includeStack: false });
    expect(s.cause).toBe("inner");
    const d = deserializeError(s);
    expect(d.cause).toBe("inner");
  });

  it("handles nested Error cause recursively", () => {
    const inner = new Error("inner-msg");
    inner.name = "InnerError";
    const outer = new Error("outer-msg", { cause: inner });
    outer.name = "OuterError";

    const s = serializeError(outer, { includeStack: false });
    expect(s.name).toBe("OuterError");
    expect(typeof s.cause).toBe("object");
    const cause = s.cause as SerializedError;
    expect(isSerializedError(cause)).toBe(true);
    expect(cause.name).toBe("InnerError");
    expect(cause.message).toBe("inner-msg");

    const d = deserializeError(s);
    expect(d.name).toBe("OuterError");
    expect(d.message).toBe("outer-msg");
    expect(d.cause instanceof Error).toBe(true);
    const dcause = d.cause as Error;
    expect(dcause.name).toBe("InnerError");
    expect(dcause.message).toBe("inner-msg");
  });

  // serializeError now accepts only Error; non-error inputs are invalid

  it("honors depth option by summarizing deep causes", () => {
    const deep = new Error("deep-cause");
    const mid = new Error("mid", { cause: deep });
    const top = new Error("top", { cause: mid });

    const s = serializeError(top, { depth: 1, includeStack: false });
    // depth:1 => cause is summarized as string (not a structured object)
    expect(typeof s.cause).toBe("string");
  });

  it("respects default includeStack based on NODE_ENV", () => {
    const prev = process.env["NODE_ENV"];
    try {
      const err = new Error("with-stack");
      // development → include stack by default
      process.env["NODE_ENV"] = "development";
      const sDev = serializeError(err);
      expect(typeof sDev.stack === "string").toBe(true);

      // production → exclude stack by default
      process.env["NODE_ENV"] = "production";
      const sProd = serializeError(err);
      expect(sProd.stack).toBeUndefined();
    } finally {
      process.env["NODE_ENV"] = prev;
    }
  });

  it("allows forcing stack inclusion via option", () => {
    const err = new Error("stack-opt");
    const s = serializeError(err, { includeStack: true });
    expect(typeof s.stack === "string").toBe(true);
  });

  // serializeError now accepts only Error; primitives/objects are not allowed

  it("passes through already-serialized cause without modification", () => {
    const inner: SerializedError = { name: "Inner", message: "m" };
    const top = new Error("top");
    top.cause = inner;
    const s = serializeError(top);
    expect(s.cause).toEqual(inner);
  });

  it("controls structured depth of cause chain", () => {
    const inner = new Error("inner");
    const mid = new Error("mid", { cause: inner });
    const top = new Error("top", { cause: mid });

    // default depth=2 → top.cause structured, mid.cause summarized string
    const sDefault = serializeError(top);
    expect(isSerializedError(sDefault.cause)).toBe(true);
    const midSer = sDefault.cause as SerializedError;
    expect(typeof midSer.cause === "string" || midSer.cause === undefined).toBe(
      true,
    );

    // depth=4 → top.cause structured, mid.cause structured
    const sDeep = serializeError(top, { depth: 4 });
    expect(isSerializedError(sDeep.cause)).toBe(true);
    const midSerDeep = sDeep.cause as SerializedError;
    expect(isSerializedError(midSerDeep.cause)).toBe(true);

    // depth=0 (coerce) → top.cause summarized string
    const sShallow = serializeError(top, { depth: 0 });
    expect(typeof sShallow.cause).toBe("string");
  });

  it("propagates includeStack option to nested causes", () => {
    const inner = new Error("inner");
    const top = new Error("top", { cause: inner });

    const withStack = serializeError(top, { includeStack: true });
    const innerWith = withStack.cause as SerializedError;
    expect(isSerializedError(innerWith)).toBe(true);
    expect(typeof innerWith.stack === "string").toBe(true);

    const withoutStack = serializeError(top, { includeStack: false });
    const innerWithout = withoutStack.cause as SerializedError;
    expect(isSerializedError(innerWithout)).toBe(true);
    expect(innerWithout.stack).toBeUndefined();
  });

  it("keeps string cause as-is without truncation", () => {
    const long = "x".repeat(300);
    const e = new Error("msg");
    e.cause = long;
    const s = serializeError(e); // default depth>0 preserves string causes
    expect(typeof s.cause).toBe("string");
    expect((s.cause as string).length).toBe(300);
  });

  it("deserializes a serialized payload with string cause", () => {
    const payload: SerializedError = {
      name: "Top",
      cause: "S",
      message: "M",
    };
    const err = deserializeError(payload);
    expect(err.name).toBe("Top");
    expect(err.message).toBe("M");
    expect(err.cause).toBe("S");
  });

  it("normalizes negative depth to 0 (summarize)", () => {
    const inner = new Error("inner");
    const top = new Error("top", { cause: inner });
    const s = serializeError(top, { depth: -1 });
    expect(typeof s.cause).toBe("string");
  });

  it("with depth=3 keeps second-level cause summarized string", () => {
    const inner = new Error("inner");
    const mid = new Error("mid", { cause: inner });
    const top = new Error("top", { cause: mid });
    const s = serializeError(top, { depth: 3 });
    expect(isSerializedError(s.cause)).toBe(true);
    const midSer = s.cause as SerializedError;
    expect(typeof midSer.cause).toBe("string");
  });

  it("isSerializedError guards valid shapes only", () => {
    expect(isSerializedError({ name: "A", message: "B" })).toBe(true);
    expect(isSerializedError({ name: "A", extra: 1, message: "B" })).toBe(true);
    expect(isSerializedError({ name: "A" })).toBe(false);
    expect(isSerializedError({ message: "B" })).toBe(false);
    expect(isSerializedError("x")).toBe(false);
    expect(isSerializedError(null)).toBe(false);
  });

  it("deserializes from unknown input with schema validation (success)", () => {
    const payload: unknown = {
      name: "X",
      cause: { name: "A", message: "B" },
      extra: 1,
      message: "Y",
    };
    const e = deserializeError(payload);
    expect(e.name).toBe("X");
    expect(e.message).toBe("Y");
    expect(e.cause instanceof Error).toBe(true);
    const c = e.cause as Error;
    expect(c.name).toBe("A");
    expect(c.message).toBe("B");
  });

  it("deserializes from unknown input with schema validation (fallback)", () => {
    const e1 = deserializeError(42);
    expect(e1).toBeInstanceOf(Error);
    expect(e1.name).toBe("UnknownError");
    // Non-string primitive falls back to string coercion
    expect(e1.message).toBe("42");

    const e2 = deserializeError({ foo: "bar" });
    expect(e2).toBeInstanceOf(Error);
    expect(e2.name).toBe("UnknownError");
    expect(e2.message).toBe('{"foo":"bar"}');

    const already = new Error("keep");
    const e3 = deserializeError(already);
    expect(e3).toBe(already);
  });

  it("uses fallback when input is not deserializable", () => {
    const payload = { foo: "bar" };
    const fallback = (cause: unknown) => {
      const err = new Error("fallback");
      err.name = "FallbackError";
      err.cause = cause;
      return err;
    };

    const err = deserializeError(payload, { fallback });

    expect(err.name).toBe("FallbackError");
    expect(err.message).toBe("fallback");
    expect(err.cause).toBe(payload);
  });
});
