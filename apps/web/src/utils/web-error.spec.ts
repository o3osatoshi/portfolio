import { describe, expect, it } from "vitest";

import {
  newWebError,
  webConflictError,
  webForbiddenError,
  webNotFoundError,
  webRateLimitError,
  webTimeoutError,
  webUnauthorizedError,
  webUnavailableError,
  webUnknownError,
  webValidationError,
} from "./web-error";

describe("utils/web-error newWebError", () => {
  it("constructs UI-layer error with structured name and message", () => {
    const err = newWebError({
      action: "SubmitForm",
      hint: "Check the form fields.",
      impact: "Form submission failed.",
      kind: "Validation",
      reason: "invalid payload",
    });

    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe("UIValidationError");
    const payload = JSON.parse(err.message);
    expect(payload.summary).toBe("SubmitForm failed");
    expect(payload.action).toBe("SubmitForm");
    expect(payload.reason).toBe("invalid payload");
    expect(payload.impact).toBe("Form submission failed.");
    expect(payload.hint).toBe("Check the form fields.");
  });
});

describe("utils/web-error convenience wrappers", () => {
  it("webValidationError uses Validation kind", () => {
    const err = webValidationError({ action: "Validate" });
    expect(err.name).toBe("UIValidationError");
  });

  it("webNotFoundError uses NotFound kind", () => {
    const err = webNotFoundError({ action: "LoadResource" });
    expect(err.name).toBe("UINotFoundError");
  });

  it("webConflictError uses Conflict kind", () => {
    const err = webConflictError({ action: "UpdateResource" });
    expect(err.name).toBe("UIConflictError");
  });

  it("webForbiddenError uses Forbidden kind", () => {
    const err = webForbiddenError({ action: "AccessPage" });
    expect(err.name).toBe("UIForbiddenError");
  });

  it("webUnauthorizedError uses Unauthorized kind", () => {
    const err = webUnauthorizedError({ action: "PerformAction" });
    expect(err.name).toBe("UIUnauthorizedError");
  });

  it("webRateLimitError uses RateLimit kind", () => {
    const err = webRateLimitError({ action: "CallAPI" });
    expect(err.name).toBe("UIRateLimitError");
  });

  it("webTimeoutError uses Timeout kind", () => {
    const err = webTimeoutError({ action: "CallSlowAPI" });
    expect(err.name).toBe("UITimeoutError");
  });

  it("webUnavailableError uses Unavailable kind", () => {
    const err = webUnavailableError({ action: "CallService" });
    expect(err.name).toBe("UIUnavailableError");
  });

  it("webUnknownError uses Unknown kind", () => {
    const err = webUnknownError({ action: "DoSomething" });
    expect(err.name).toBe("UIUnknownError");
  });
});
