import { describe, expect, it } from "vitest";

import { newError } from "../error";
import { type ActionError, err, ok } from "./action-state";

describe("action-state ok/err", () => {
  it("wraps data with ok: true", () => {
    const state = ok({ foo: "bar" });
    if (!state.ok) throw new Error("expected success state");
    expect(state.ok).toBe(true);
    expect(state.data).toEqual({ foo: "bar" });
  });

  it("wraps string errors with default name", () => {
    const state = err("oops");
    expect(state.ok).toBe(false);
    if (state.ok) throw new Error("expected failure state");
    expect(state.error.message).toBe("oops");
    expect(state.error.name).toBe("ActionError");
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

  it("passes through ActionError objects", () => {
    const actionError: ActionError = { name: "Custom", message: "broken" };
    const state = err(actionError);
    expect(state.ok).toBe(false);
    if (state.ok) throw new Error("expected failure state");
    expect(state.error).toBe(actionError);
  });

  it("preserves native Error name and derives a user-facing message", () => {
    const error = new Error("plain message");
    error.name = "CustomError";
    const state = err(error);
    expect(state.ok).toBe(false);
    if (state.ok) throw new Error("expected failure state");
    expect(state.error.name).toBe("CustomError");
    expect(state.error.message).toBe("plain message");
  });

  it("uses toolkit metadata to produce a friendly message", () => {
    const error = newError({ kind: "Forbidden", layer: "Application" });
    const state = err(error);
    expect(state.ok).toBe(false);
    if (state.ok) throw new Error("expected failure state");
    expect(state.error.name).toBe("ApplicationForbiddenError");
    expect(state.error.message).toBe(
      "You do not have permission to perform this action.",
    );
  });
});
