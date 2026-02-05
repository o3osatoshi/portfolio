import { describe, expect, it } from "vitest";

import { newRichError } from "../error";
import { userMessageFromError } from "./error-message";

describe("userMessageFromError", () => {
  it("returns a kind-based message with details for Validation errors", () => {
    const error = newRichError({
      details: {
        hint: "Include @ in email",
        reason: "Email format is invalid",
      },
      kind: "Validation",
      layer: "Application",
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
