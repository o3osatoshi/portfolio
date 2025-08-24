import { describe, it, expect } from "vitest";
import { newError } from "./error";

describe("newError", () => {
  it("builds name and message with all fields and Error cause", () => {
    const cause = new Error("DB timeout");
    const err = newError({
      layer: "Domain",
      kind: "Validation",
      action: "UpdateTransaction",
      reason: "transaction not found",
      impact: "no update applied",
      hint: "verify txId",
      cause,
    });

    expect(err.name).toBe("DomainValidationError");
    expect(err.message).toBe(
      "UpdateTransaction failed because transaction not found Impact: no update applied. Hint: verify txId. Cause: DB timeout.",
    );
  });

  it("defaults action phrase when action is omitted", () => {
    const err = newError({
      layer: "Application",
      kind: "Unknown",
      reason: "something went wrong",
    });
    expect(err.name).toBe("ApplicationUnknownError");
    expect(err.message.startsWith("Operation failed because something went wrong")).toBe(
      true,
    );
  });

  it("summarizes long string causes with an ellipsis", () => {
    const long = "a".repeat(400);
    const err = newError({ layer: "Infra", kind: "Timeout", cause: long });

    expect(err.name).toBe("InfraTimeoutError");
    expect(err.message).toContain("Cause: ");
    // Ensure truncation marker is present
    expect(err.message).toContain("…");
  });

  it("supports other layers and kinds (Auth/Forbidden)", () => {
    const err = newError({ layer: "Auth", kind: "Forbidden", action: "SignIn" });
    expect(err.name).toBe("AuthForbiddenError");
    expect(err.message.startsWith("SignIn failed")).toBe(true);
  });
});
