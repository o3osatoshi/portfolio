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

    // Name
    expect(err.name).toBe("InfraTimeoutError");
    // Message order pieces exist
    expect(err.message).toContain("FetchUser failed");
    expect(err.message).toContain("because dependency unavailable");
    expect(err.message).toContain("Impact: no data returned.");
    expect(err.message).toContain("Hint: retry with backoff.");
    expect(err.message).toContain("Cause: DB timeout.");
    // Cause attached (native ErrorOptions or fallback defineProperty)
    expect("cause" in err).toBe(true);
    expect(err.cause).toBe(cause);
  });
});
