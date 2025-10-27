import { describe, expect, it } from "vitest";

import { newError } from "./error";

describe("newError", () => {
  it("composes name and message, and attaches cause", () => {
    const cause = new Error("DB timeout");
    const err = newError({
      action: "FetchUser",
      cause,
      hint: "retry with backoff",
      impact: "no data returned",
      kind: "Timeout",
      layer: "Infra",
      reason: "dependency unavailable",
    });

    expect(err.name).toBe("InfraTimeoutError");
    expect(err.message).toContain("FetchUser failed");
    expect(err.message).toContain("DB timeout");
    expect(err.message).toContain("retry with backoff");
    expect(err.message).toContain("no data returned");
    expect(err.message).toContain("dependency unavailable");
    // Cause attached (native ErrorOptions or fallback defineProperty)
    expect("cause" in err).toBe(true);
    expect(err.cause).toBe(cause);
  });

  it("falls back when Error options are unsupported, keeping cause non-enumerable", () => {
    const originalError = globalThis.Error;
    class LegacyError extends originalError {
      constructor(message?: string, options?: { cause?: unknown }) {
        if (options && "cause" in options) {
          throw new originalError("Legacy runtime ignores cause options");
        }
        super(message);
      }
    }
    globalThis.Error = LegacyError as unknown as ErrorConstructor;

    const cause = { detail: "legacy failure" };
    try {
      const err = newError({
        action: "LegacyOp",
        cause,
        kind: "Unknown",
        layer: "Domain",
      });

      expect(err).toBeInstanceOf(LegacyError);
      expect(err.name).toBe("DomainUnknownError");
      expect(err.message).toContain("legacy failure");

      const descriptor = Object.getOwnPropertyDescriptor(err, "cause");
      expect(descriptor?.enumerable).toBe(false);
      expect(err.cause).toBe(cause);
    } finally {
      globalThis.Error = originalError;
    }
  });

  it("summarizes non-error causes using name or string fallbacks", () => {
    const namedCause = { name: "WidgetFailure" };
    const namedErr = newError({
      action: "ProcessWidget",
      cause: namedCause,
      kind: "Unknown",
      layer: "Application",
    });
    expect(namedErr.message).toContain("WidgetFailure");

    const circular: { self?: unknown } = {};
    circular.self = circular;
    const circularErr = newError({
      action: "SerializeData",
      cause: circular,
      kind: "Unknown",
      layer: "Infra",
    });
    expect(circularErr.message).toContain("[object Object]");
  });
});
