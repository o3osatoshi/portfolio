import { describe, expect, it } from "vitest";

import { isRichError, newRichError } from "./error";
import {
  deserializeRichError,
  isSerializedError,
  isSerializedRichError,
  type SerializedError,
  serializeRichError,
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

    const s = serializeRichError(err, { includeStack: false });
    expect(s.kind).toBe("Validation");
    expect(s.layer).toBe("Application");
    expect(s.code).toBe("user.invalid");
    expect(s.details?.action).toBe("CreateUser");
    expect(s.i18n?.key).toBe("error.user_invalid");
    expect(s.meta).toEqual({ requestId: "req_1" });
    expect(isSerializedRichError(s)).toBe(true);

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
    const payload: SerializedError = { name: "TestError", message: "oops" };

    const err = deserializeRichError(payload);
    expect(err.kind).toBe("Serialization");
    expect(err.layer).toBe("External");
    expect(err.code).toBe("RICH_ERROR_DESERIALIZE_FAILED");
  });

  it("tryDeserializeRichError returns Err for serialized non-rich payload", () => {
    const payload: SerializedError = { name: "TestError", message: "oops" };

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
      kind: "Internal",
      layer: "Infrastructure",
    });
    const s = serializeRichError(e, { includeStack: false });
    expect(s.cause).toBe("inner");
    const d = deserializeRichError(s);
    expect(d.cause).toBe("inner");
  });

  it("handles nested cause recursively", () => {
    const inner = new Error("inner-msg");
    inner.name = "InnerError";
    const outer = newRichError({
      cause: inner,
      kind: "Internal",
      layer: "Infrastructure",
    });

    const s = serializeRichError(outer, { includeStack: false });
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
    const top = newRichError({
      cause: mid,
      kind: "Internal",
      layer: "Infrastructure",
    });

    const s = serializeRichError(top, { depth: 1, includeStack: false });
    expect(typeof s.cause).toBe("string");
  });

  it("respects default includeStack based on NODE_ENV", () => {
    const prev = process.env["NODE_ENV"];
    try {
      const err = newRichError({ kind: "Internal", layer: "Infrastructure" });
      process.env["NODE_ENV"] = "development";
      const sDev = serializeRichError(err);
      expect(typeof sDev.stack === "string").toBe(true);

      process.env["NODE_ENV"] = "production";
      const sProd = serializeRichError(err);
      expect(sProd.stack).toBeUndefined();
    } finally {
      process.env["NODE_ENV"] = prev;
    }
  });

  it("allows forcing stack inclusion via option", () => {
    const err = newRichError({ kind: "Internal", layer: "Infrastructure" });
    const s = serializeRichError(err, { includeStack: true });
    expect(typeof s.stack === "string").toBe(true);
  });

  it("passes through already-serialized cause without modification", () => {
    const inner: SerializedError = { name: "Inner", message: "m" };
    const top = newRichError({
      cause: inner,
      kind: "Internal",
      layer: "Infrastructure",
    });
    const s = serializeRichError(top);
    expect(s.cause).toEqual(inner);
  });

  it("controls structured depth of cause chain", () => {
    const inner = new Error("inner");
    const mid = new Error("mid", { cause: inner });
    const top = newRichError({
      cause: mid,
      kind: "Internal",
      layer: "Infrastructure",
    });

    const sDefault = serializeRichError(top);
    expect(isSerializedError(sDefault.cause)).toBe(true);
    const midSer = sDefault.cause as SerializedError;
    expect(typeof midSer.cause === "string" || midSer.cause === undefined).toBe(
      true,
    );

    const sDeep = serializeRichError(top, { depth: 4 });
    expect(isSerializedError(sDeep.cause)).toBe(true);
    const midSerDeep = sDeep.cause as SerializedError;
    expect(isSerializedError(midSerDeep.cause)).toBe(true);

    const sShallow = serializeRichError(top, { depth: 0 });
    expect(typeof sShallow.cause).toBe("string");
  });

  it("propagates includeStack option to nested causes", () => {
    const inner = new Error("inner");
    const top = newRichError({
      cause: inner,
      kind: "Internal",
      layer: "Infrastructure",
    });

    const withStack = serializeRichError(top, { includeStack: true });
    const innerWith = withStack.cause as SerializedError;
    expect(isSerializedError(innerWith)).toBe(true);
    expect(typeof innerWith.stack === "string").toBe(true);

    const withoutStack = serializeRichError(top, { includeStack: false });
    const innerWithout = withoutStack.cause as SerializedError;
    expect(isSerializedError(innerWithout)).toBe(true);
    expect(innerWithout.stack).toBeUndefined();
  });

  it("keeps string cause as-is without truncation", () => {
    const long = "x".repeat(300);
    const e = newRichError({
      cause: long,
      kind: "Internal",
      layer: "Infrastructure",
    });
    const s = serializeRichError(e);
    expect(typeof s.cause).toBe("string");
    expect((s.cause as string).length).toBe(300);
  });

  it("normalizes negative depth to 0 (summarize)", () => {
    const inner = new Error("inner");
    const top = newRichError({
      cause: inner,
      kind: "Internal",
      layer: "Infrastructure",
    });
    const s = serializeRichError(top, { depth: -1 });
    expect(typeof s.cause).toBe("string");
  });

  it("with depth=3 keeps second-level cause summarized string", () => {
    const inner = new Error("inner");
    const mid = new Error("mid", { cause: inner });
    const top = newRichError({
      cause: mid,
      kind: "Internal",
      layer: "Infrastructure",
    });
    const s = serializeRichError(top, { depth: 3 });
    expect(isSerializedError(s.cause)).toBe(true);
    const midSer = s.cause as SerializedError;
    expect(typeof midSer.cause).toBe("string");
  });

  it("isSerializedError guards valid shapes only", () => {
    expect(isSerializedError({ name: "A", message: "B" })).toBe(true);
    expect(isSerializedError({ name: "A", extra: 1, message: "B" })).toBe(true);
    expect(isSerializedError({ name: 123, message: "B" })).toBe(false);
    expect(isSerializedError({ name: "A", message: 42 })).toBe(false);
    expect(isSerializedError({ name: "A" })).toBe(false);
    expect(isSerializedError({ message: "B" })).toBe(false);
    expect(isSerializedError("x")).toBe(false);
    expect(isSerializedError(null)).toBe(false);
  });

  it("isSerializedRichError requires kind/layer", () => {
    expect(
      isSerializedRichError({
        name: "ApplicationValidationError",
        kind: "Validation",
        layer: "Application",
        message: "msg",
      }),
    ).toBe(true);
    expect(
      isSerializedRichError({
        name: "Error",
        message: "msg",
      }),
    ).toBe(false);
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

  it("rehydrates empty stack/message values without dropping them", () => {
    const result = tryDeserializeRichError({
      name: "ApplicationInternalError",
      kind: "Internal",
      layer: "Application",
      message: "",
      stack: "",
    });

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.message).toBe("");
      expect(result.value.stack).toBe("");
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
        layer: "Infrastructure",
        meta: { endpoint: "/webhook" },
        source: "webhook.transport",
      },
    );

    expect(err.kind).toBe("Serialization");
    expect(err.layer).toBe("Infrastructure");
    expect(err.code).toBe("WEBHOOK_ERROR_DESERIALIZE_FAILED");
    expect(err.details?.action).toBe("DeserializeWebhookError");
    expect(err.i18n?.key).toBe("errors.webhook.deserialize_failed");
    expect(err.meta?.["endpoint"]).toBe("/webhook");
    expect(err.meta?.["source"]).toBe("webhook.transport");
  });

  it("tryDeserializeRichError returns the same instance for RichError input", () => {
    const rich = newRichError({ kind: "Internal", layer: "Application" });
    const result = tryDeserializeRichError(rich);
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value).toBe(rich);
    }
  });
});
