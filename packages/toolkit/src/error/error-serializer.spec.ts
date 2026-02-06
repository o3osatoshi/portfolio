import { describe, expect, it } from "vitest";

import { isRichError, newRichError } from "./error";
import {
  deserializeRichError,
  isSerializedError,
  type SerializedError,
  serializeError,
  tryDeserializeRichError,
} from "./error-serializer";

describe("error-serializer", () => {
  it("serializes rich error fields and rehydrates RichError", () => {
    const err = newRichError({
      code: "user.invalid",
      details: {
        action: "CreateUser",
        reason: "Email is invalid",
      },
      i18n: { key: "error.user_invalid", params: { id: 1 } },
      kind: "Validation",
      layer: "Application",
      meta: { requestId: "req_1" },
    });

    const s = serializeError(err, { includeStack: false });
    expect(s.kind).toBe("Validation");
    expect(s.layer).toBe("Application");
    expect(s.code).toBe("user.invalid");
    expect(s.details?.action).toBe("CreateUser");
    expect(s.i18n?.key).toBe("error.user_invalid");
    expect(s.meta).toEqual({ requestId: "req_1" });

    const d = deserializeRichError(s);
    expect(isRichError(d)).toBe(true);
    expect(d.kind).toBe("Validation");
    expect(d.layer).toBe("Application");
    expect(d.code).toBe("user.invalid");
    expect(d.details?.reason).toBe("Email is invalid");
    expect(d.i18n?.params).toEqual({ id: 1 });
    expect(d.meta).toEqual({ requestId: "req_1" });
  });

  it("returns a serialization RichError for non-rich payload", () => {
    const plain = new Error("oops");
    plain.name = "TestError";
    const payload = serializeError(plain, { includeStack: false });

    const err = deserializeRichError(payload);
    expect(err.kind).toBe("Serialization");
    expect(err.layer).toBe("External");
    expect(err.code).toBe("RICH_ERROR_DESERIALIZE_FAILED");
  });

  it("tryDeserializeRichError returns Err for serialized non-rich payload", () => {
    const plain = new Error("oops");
    const payload = serializeError(plain, { includeStack: false });

    const result = tryDeserializeRichError(payload);
    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.issues.some((issue) => issue.path === "kind")).toBe(
        true,
      );
      expect(result.error.issues.some((issue) => issue.path === "layer")).toBe(
        true,
      );
    }
  });

  it("handles string cause in serialized rich payload", () => {
    const e = newRichError({
      cause: "inner",
      kind: "Unknown",
      layer: "Infra",
    });
    const s = serializeError(e, { includeStack: false });
    expect(s.cause).toBe("inner");
    const d = deserializeRichError(s);
    expect(d.cause).toBe("inner");
  });

  it("handles nested cause recursively", () => {
    const inner = new Error("inner-msg");
    inner.name = "InnerError";
    const outer = newRichError({
      cause: inner,
      kind: "Unknown",
      layer: "Infra",
    });

    const s = serializeError(outer, { includeStack: false });
    expect(typeof s.cause).toBe("object");
    const cause = s.cause as SerializedError;
    expect(isSerializedError(cause)).toBe(true);
    expect(cause.name).toBe("InnerError");
    expect(cause.message).toBe("inner-msg");

    const d = deserializeRichError(s);
    expect(d.cause instanceof Error).toBe(true);
    const dcause = d.cause as Error;
    expect(dcause.name).toBe("InnerError");
    expect(dcause.message).toBe("inner-msg");
  });

  it("honors depth option by summarizing deep causes", () => {
    const deep = new Error("deep-cause");
    const mid = new Error("mid", { cause: deep });
    const top = new Error("top", { cause: mid });

    const s = serializeError(top, { depth: 1, includeStack: false });
    expect(typeof s.cause).toBe("string");
  });

  it("respects default includeStack based on NODE_ENV", () => {
    const prev = process.env["NODE_ENV"];
    try {
      const err = new Error("with-stack");
      process.env["NODE_ENV"] = "development";
      const sDev = serializeError(err);
      expect(typeof sDev.stack === "string").toBe(true);

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

    const sDefault = serializeError(top);
    expect(isSerializedError(sDefault.cause)).toBe(true);
    const midSer = sDefault.cause as SerializedError;
    expect(typeof midSer.cause === "string" || midSer.cause === undefined).toBe(
      true,
    );

    const sDeep = serializeError(top, { depth: 4 });
    expect(isSerializedError(sDeep.cause)).toBe(true);
    const midSerDeep = sDeep.cause as SerializedError;
    expect(isSerializedError(midSerDeep.cause)).toBe(true);

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
    const s = serializeError(e);
    expect(typeof s.cause).toBe("string");
    expect((s.cause as string).length).toBe(300);
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

  it("tryDeserializeRichError succeeds for valid serialized RichError payload", () => {
    const payload: unknown = {
      name: "ApplicationNotFoundError",
      code: "resource.missing",
      details: { action: "GetResource", reason: "missing" },
      kind: "NotFound",
      layer: "Application",
      message: "GetResource failed: missing",
    };
    const result = tryDeserializeRichError(payload);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.kind).toBe("NotFound");
      expect(result.value.layer).toBe("Application");
      expect(result.value.code).toBe("resource.missing");
    }
  });

  it("deserializeRichError returns structured failure for invalid payload", () => {
    const err = deserializeRichError(42);
    expect(err.kind).toBe("Serialization");
    expect(err.layer).toBe("External");
    expect(err.code).toBe("RICH_ERROR_DESERIALIZE_FAILED");
    expect(err.meta?.["inputType"]).toBe("number");
    expect(typeof err.meta?.["issueCount"]).toBe("number");
  });

  it("deserializeRichError supports custom failure metadata", () => {
    const err = deserializeRichError(
      { foo: "bar" },
      {
        action: "DeserializeWebhookError",
        code: "WEBHOOK_ERROR_DESERIALIZE_FAILED",
        i18nKey: "errors.webhook.deserialize_failed",
        layer: "Infra",
        meta: { endpoint: "/webhook" },
        source: "webhook.transport",
      },
    );

    expect(err.kind).toBe("Serialization");
    expect(err.layer).toBe("Infra");
    expect(err.code).toBe("WEBHOOK_ERROR_DESERIALIZE_FAILED");
    expect(err.details?.action).toBe("DeserializeWebhookError");
    expect(err.i18n?.key).toBe("errors.webhook.deserialize_failed");
    expect(err.meta?.["endpoint"]).toBe("/webhook");
    expect(err.meta?.["source"]).toBe("webhook.transport");
  });

  it("tryDeserializeRichError returns the same instance for RichError input", () => {
    const rich = newRichError({ kind: "Unknown", layer: "Application" });
    const result = tryDeserializeRichError(rich);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(rich);
    }
  });
});
