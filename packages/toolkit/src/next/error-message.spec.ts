import { describe, expect, it } from "vitest";

import { composeErrorMessage, newError } from "../error";
import { userMessageFromError } from "./error-message";

describe("userMessageFromError", () => {
  it("returns a kind-based message with details for Validation errors", () => {
    const error = newError({
      hint: "Include @ in email",
      kind: "Validation",
      layer: "Application",
      reason: "Email format is invalid",
    });

    const message = userMessageFromError(error);
    expect(message).toContain(
      "Some inputs look incorrect. Please review and try again.",
    );
    expect(message).toContain("Email format is invalid");
    expect(message).toContain("Hint: Include @ in email");
  });

  it("uses name-based fallback kind mapping for AbortError", () => {
    const error = new Error("canceled by user");
    error.name = "AbortError";

    const message = userMessageFromError(error);
    expect(message).toBe("The operation was canceled.");
  });

  it("derives details from structured message when no kind exists", () => {
    const serialized = composeErrorMessage({
      hint: "Try again",
      impact: "No changes were saved",
      reason: "Unexpected format",
    });
    const error = new Error(serialized);

    const message = userMessageFromError(error);
    expect(message).toBe(
      "Unexpected format Impact: No changes were saved Hint: Try again",
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
