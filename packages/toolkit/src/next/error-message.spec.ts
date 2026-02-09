import { describe, expect, it } from "vitest";

import { newRichError } from "../error";
import { userMessageFromError } from "./error-message";

describe("userMessageFromError", () => {
  it("returns details-based message for RichError", () => {
    const error = newRichError({
      details: {
        hint: "Include @ in email",
        impact: "Form submission was rejected",
        reason: "Email format is invalid",
      },
      kind: "Validation",
      layer: "Application",
    });

    const message = userMessageFromError(error);
    expect(message).toContain("Email format is invalid");
    expect(message).toContain("Impact: Form submission was rejected");
    expect(message).toContain("Hint: Include @ in email");
  });

  it("uses fallback when message equals error name", () => {
    const error = newRichError({
      kind: "Forbidden",
      layer: "Application",
    });
    const message = userMessageFromError(error);
    expect(message).toBe(
      "We could not complete your request due to an unknown error. Please try again.",
    );
  });

  it("falls back to the raw message when not JSON-like", () => {
    const error = new Error("plain failure");
    const message = userMessageFromError(error);
    expect(message).toBe("plain failure");
  });

  it("falls back to a generic message for JSON-looking payloads that cannot be parsed", () => {
    const error = new Error("{not-json");
    const message = userMessageFromError(error);
    expect(message).toBe(
      "We could not complete your request due to an unknown error. Please try again.",
    );
  });
});
