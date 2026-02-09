import { describe, expect, it } from "vitest";

import {
  deserializeRichError,
  isSerializedRichError,
  newRichError,
} from "../error";
import { err, ok } from "./action-state";

describe("action-state ok/err", () => {
  it("wraps data with ok: true", () => {
    const state = ok({ foo: "bar" });
    if (!state.ok) throw new Error("expected success state");
    expect(state.ok).toBe(true);
    expect(state.data).toEqual({ foo: "bar" });
  });

  it("allows null and undefined as data", () => {
    const nullState = ok(null);
    const undefinedState = ok(undefined);

    expect(nullState.ok).toBe(true);
    if (!nullState.ok) throw new Error("expected success state for null");
    expect(nullState.data).toBeNull();

    expect(undefinedState.ok).toBe(true);
    if (!undefinedState.ok)
      throw new Error("expected success state for undefined");
    expect("data" in undefinedState).toBe(true);
    expect(undefinedState.data).toBeUndefined();
  });

  it("serializes RichError for ActionState transport", () => {
    const error = newRichError({
      code: "APP_FORBIDDEN",
      i18n: { key: "errors.application.forbidden" },
      isOperational: true,
      kind: "Forbidden",
      layer: "Application",
    });
    const state = err(error);
    expect(state.ok).toBe(false);
    if (state.ok) throw new Error("expected failure state");
    expect(isSerializedRichError(state.error)).toBe(true);
    expect(state.error.name).toBe("ApplicationForbiddenError");
    expect(state.error.message).toBe("ApplicationForbiddenError");
    expect(state.error.code).toBe("APP_FORBIDDEN");
    expect(state.error.i18n).toEqual({
      key: "errors.application.forbidden",
    });
    expect(state.error.kind).toBe("Forbidden");
    expect(state.error.layer).toBe("Application");
    expect(state.error.stack).toBeUndefined();
  });

  it("supports rehydrating serialized action errors to RichError", () => {
    const serialized = err(
      newRichError({
        code: "APP_NOT_FOUND",
        i18n: { key: "errors.application.not_found" },
        isOperational: true,
        kind: "NotFound",
        layer: "Application",
      }),
    );
    expect(serialized.ok).toBe(false);
    if (serialized.ok) throw new Error("expected failure state");

    const deserialized = deserializeRichError(serialized.error);
    expect(deserialized.name).toBe("ApplicationNotFoundError");
    expect(deserialized.code).toBe("APP_NOT_FOUND");
    expect(deserialized.i18n).toEqual({
      key: "errors.application.not_found",
    });
  });
});
